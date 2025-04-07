"use client"

import { useState } from "react"
import { FileUploader } from "./file-uploader"
import { ImageList } from "./image-list"
import { RenameOptions } from "./rename-options"
import { Button } from "@/components/ui/button"
import { Download, Grid, List } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import JSZip from "jszip"
import saveAs from "file-saver"
import { useTranslations } from "./language-provider"

export type ImageFile = {
  id: string
  file: File
  preview: string
  originalName: string
  newName: string
  isEditing?: boolean
}

export type DateFormat = "YYYY-MM-DD" | "DD-MM-YYYY" | "YYYYMMDD" | "DDMMYYYY"
export type ViewMode = "grid" | "list"
export type SerialType = "numeric" | "alphabetic"

// Historial de operaciones para poder deshacer
type HistoryOperation = {
  type: string
  images: ImageFile[]
}

export function ImageRenamer() {
  const { t } = useTranslations()
  const { toast } = useToast()
  const [images, setImages] = useState<ImageFile[]>([])
  const [prefix, setPrefix] = useState("")
  const [prefixToRemove, setPrefixToRemove] = useState("")
  const [suffix, setSuffix] = useState("")
  const [suffixToRemove, setSuffixToRemove] = useState("")
  const [dateFormat, setDateFormat] = useState<DateFormat>("YYYY-MM-DD")
  const [serialStart, setSerialStart] = useState(1)
  const [serialPadding, setSerialPadding] = useState(3)
  const [serialType, setSerialType] = useState<SerialType>("numeric")
  const [viewMode, setViewMode] = useState<ViewMode>("grid")
  const [history, setHistory] = useState<HistoryOperation[]>([])
  const [appliedOperations, setAppliedOperations] = useState<Set<string>>(new Set())

  // Estado para el diálogo de reinicio de nombres
  const [resetDialogOpen, setResetDialogOpen] = useState(false)
  const [resetSerialStart, setResetSerialStart] = useState(1)
  const [resetSerialPadding, setResetSerialPadding] = useState(3)
  const [resetSerialType, setResetSerialType] = useState<SerialType>("numeric")

  // Guardar el estado actual en el historial antes de modificarlo
  const saveToHistory = (operationType: string) => {
    setHistory((prev) => [...prev, { type: operationType, images: [...images] }])
  }

  // Deshacer la última operación
  const undoLastOperation = () => {
    if (history.length === 0) return

    const lastOperation = history[history.length - 1]
    setImages(lastOperation.images)
    setHistory((prev) => prev.slice(0, -1))

    toast({
      title: t("operationUndone"),
      description: t("lastOperationUndone", { operation: lastOperation.type }),
    })
  }

  // Verificar si una operación ya ha sido aplicada
  const checkIfOperationApplied = (operationKey: string): boolean => {
    if (appliedOperations.has(operationKey)) {
      toast({
        title: t("operationAlreadyApplied"),
        description: t("operationAlreadyAppliedDesc"),
        variant: "destructive",
      })
      return true
    }
    return false
  }

  // Marcar una operación como aplicada
  const markOperationAsApplied = (operationKey: string) => {
    setAppliedOperations((prev) => new Set(prev).add(operationKey))
  }

  const handleFilesAdded = (files: File[]) => {
    const newImages = files.map((file) => {
      const id = Math.random().toString(36).substring(2, 9)
      return {
        id,
        file,
        preview: URL.createObjectURL(file),
        originalName: file.name,
        newName: file.name,
      }
    })

    setImages((prev) => [...prev, ...newImages])
    // Limpiar operaciones aplicadas cuando se añaden nuevas imágenes
    setAppliedOperations(new Set())
  }

  const handleRemoveImage = (id: string) => {
    saveToHistory("removeImage")
    setImages((prev) => prev.filter((img) => img.id !== id))
  }

  const applyPrefix = () => {
    if (!prefix) return

    const operationKey = `prefix:${prefix}`
    if (checkIfOperationApplied(operationKey)) return

    saveToHistory("applyPrefix")

    setImages((prev) =>
      prev.map((img) => ({
        ...img,
        newName: `${prefix}${img.newName}`,
      })),
    )

    markOperationAsApplied(operationKey)
    // Establecer automáticamente el prefijo en el campo de quitar prefijo
    setPrefixToRemove(prefix)

    toast({
      title: t("prefixApplied"),
      description: t("prefixAppliedDesc", { prefix }),
    })
  }

  const removePrefixFromAll = () => {
    if (!prefixToRemove) return

    const operationKey = `removePrefix:${prefixToRemove}`
    if (checkIfOperationApplied(operationKey)) return

    saveToHistory("removePrefix")

    let anyRemoved = false

    setImages((prev) =>
      prev.map((img) => {
        if (img.newName.startsWith(prefixToRemove)) {
          anyRemoved = true
          return {
            ...img,
            newName: img.newName.substring(prefixToRemove.length),
          }
        }
        return img
      }),
    )

    if (!anyRemoved) {
      toast({
        title: t("noPrefixFound"),
        description: t("noPrefixFoundDesc", { prefix: prefixToRemove }),
        variant: "destructive",
      })
      return
    }

    markOperationAsApplied(operationKey)

    toast({
      title: t("prefixRemoved"),
      description: t("prefixRemovedDesc", { prefix: prefixToRemove }),
    })
  }

  const applySuffix = () => {
    if (!suffix) return

    const operationKey = `suffix:${suffix}`
    if (checkIfOperationApplied(operationKey)) return

    saveToHistory("applySuffix")

    setImages((prev) =>
      prev.map((img) => {
        const lastDotIndex = img.newName.lastIndexOf(".")
        if (lastDotIndex === -1) {
          return {
            ...img,
            newName: `${img.newName}${suffix}`,
          }
        }

        const nameWithoutExt = img.newName.substring(0, lastDotIndex)
        const extension = img.newName.substring(lastDotIndex)

        return {
          ...img,
          newName: `${nameWithoutExt}${suffix}${extension}`,
        }
      }),
    )

    markOperationAsApplied(operationKey)
    // Establecer automáticamente el sufijo en el campo de quitar sufijo
    setSuffixToRemove(suffix)

    toast({
      title: t("suffixApplied"),
      description: t("suffixAppliedDesc", { suffix }),
    })
  }

  const removeSuffixFromAll = () => {
    if (!suffixToRemove) return

    const operationKey = `removeSuffix:${suffixToRemove}`
    if (checkIfOperationApplied(operationKey)) return

    saveToHistory("removeSuffix")

    let anyRemoved = false

    setImages((prev) =>
      prev.map((img) => {
        const lastDotIndex = img.newName.lastIndexOf(".")
        if (lastDotIndex === -1) {
          if (img.newName.endsWith(suffixToRemove)) {
            anyRemoved = true
            return {
              ...img,
              newName: img.newName.substring(0, img.newName.length - suffixToRemove.length),
            }
          }
        } else {
          const nameWithoutExt = img.newName.substring(0, lastDotIndex)
          const extension = img.newName.substring(lastDotIndex)

          if (nameWithoutExt.endsWith(suffixToRemove)) {
            anyRemoved = true
            return {
              ...img,
              newName: `${nameWithoutExt.substring(0, nameWithoutExt.length - suffixToRemove.length)}${extension}`,
            }
          }
        }
        return img
      }),
    )

    if (!anyRemoved) {
      toast({
        title: t("noSuffixFound"),
        description: t("noSuffixFoundDesc", { suffix: suffixToRemove }),
        variant: "destructive",
      })
      return
    }

    markOperationAsApplied(operationKey)

    toast({
      title: t("suffixRemoved"),
      description: t("suffixRemovedDesc", { suffix: suffixToRemove }),
    })
  }

  const formatDate = (format: DateFormat): string => {
    const now = new Date()
    const year = now.getFullYear().toString()
    const month = (now.getMonth() + 1).toString().padStart(2, "0")
    const day = now.getDate().toString().padStart(2, "0")

    switch (format) {
      case "YYYY-MM-DD":
        return `${year}-${month}-${day}`
      case "DD-MM-YYYY":
        return `${day}-${month}-${year}`
      case "YYYYMMDD":
        return `${year}${month}${day}`
      case "DDMMYYYY":
        return `${day}${month}${year}`
      default:
        return `${year}-${month}-${day}`
    }
  }

  const addDatePrefix = () => {
    const date = formatDate(dateFormat)
    const operationKey = `datePrefix:${date}`
    if (checkIfOperationApplied(operationKey)) return

    saveToHistory("addDatePrefix")

    setImages((prev) =>
      prev.map((img) => ({
        ...img,
        newName: `${date}_${img.newName}`,
      })),
    )

    markOperationAsApplied(operationKey)

    toast({
      title: t("datePrefixApplied"),
      description: t("datePrefixAppliedDesc", { date }),
    })
  }

  const addDateSuffix = () => {
    const date = formatDate(dateFormat)
    const operationKey = `dateSuffix:${date}`
    if (checkIfOperationApplied(operationKey)) return

    saveToHistory("addDateSuffix")

    setImages((prev) =>
      prev.map((img) => {
        const lastDotIndex = img.newName.lastIndexOf(".")
        if (lastDotIndex === -1) {
          return {
            ...img,
            newName: `${img.newName}_${date}`,
          }
        }

        const nameWithoutExt = img.newName.substring(0, lastDotIndex)
        const extension = img.newName.substring(lastDotIndex)

        return {
          ...img,
          newName: `${nameWithoutExt}_${date}${extension}`,
        }
      }),
    )

    markOperationAsApplied(operationKey)

    toast({
      title: t("dateSuffixApplied"),
      description: t("dateSuffixAppliedDesc", { date }),
    })
  }

  // Función para generar un carácter alfabético basado en un número
  const getAlphabeticChar = (num: number): string => {
    // Convertir a base 26 (A-Z)
    let result = ""
    let n = num

    while (n > 0) {
      const remainder = (n - 1) % 26
      result = String.fromCharCode(65 + remainder) + result
      n = Math.floor((n - 1) / 26)
    }

    return result || "A" // Si num es 0, devolver 'A'
  }

  const addSerialNumbers = (
    type: SerialType = serialType,
    start: number = serialStart,
    padding: number = serialPadding,
  ) => {
    const operationKey = `serial:${type}:${start}:${padding}`
    if (checkIfOperationApplied(operationKey)) return

    saveToHistory("addSerialNumbers")

    setImages((prev) =>
      prev.map((img, index) => {
        let serialValue

        if (type === "numeric") {
          serialValue = (start + index).toString().padStart(padding, "0")
        } else {
          // Alfabético (A, B, C, ..., Z, AA, AB, ...)
          serialValue = getAlphabeticChar(start + index)
          // Padding no se aplica a letras de la misma manera
        }

        return {
          ...img,
          newName: `${serialValue}_${img.newName}`,
        }
      }),
    )

    markOperationAsApplied(operationKey)

    toast({
      title: t("serialNumbersApplied"),
      description: t("serialNumbersAppliedDesc"),
    })
  }

  // Función para reordenar imágenes (arrastrar y soltar)
  const reorderImages = (sourceIndex: number, destinationIndex: number) => {
    if (sourceIndex === destinationIndex) return

    saveToHistory("reorderImages")

    setImages((prev) => {
      const result = [...prev]
      const [removed] = result.splice(sourceIndex, 1)
      result.splice(destinationIndex, 0, removed)
      return result
    })

    toast({
      title: t("imagesReordered"),
      description: t("imagesReorderedDesc"),
    })
  }

  // Extraer metadatos de las imágenes (nombre de archivo, dimensiones, etc.)
  const extractMetadata = () => {
    saveToHistory("extractMetadata")

    // Simulación de extracción de metadatos (en una implementación real, se extraerían datos EXIF)
    setImages((prev) =>
      prev.map((img) => {
        const nameParts = img.originalName.split(".")
        const nameWithoutExt = nameParts.slice(0, -1).join(".")
        return {
          ...img,
          newName: nameWithoutExt,
        }
      }),
    )

    toast({
      title: t("metadataExtracted"),
      description: t("metadataExtractedDesc"),
    })
  }

  const handleEditName = (id: string, isEditing: boolean) => {
    setImages((prev) => prev.map((img) => (img.id === id ? { ...img, isEditing } : img)))
  }

  const handleUpdateName = (id: string, newName: string) => {
    saveToHistory("editName")

    setImages((prev) => prev.map((img) => (img.id === id ? { ...img, newName, isEditing: false } : img)))

    toast({
      title: t("nameUpdated"),
      description: t("nameUpdatedDesc"),
    })
  }

  const downloadImages = async () => {
    if (images.length === 0) return

    const zip = new JSZip()

    // Add each image to the zip file with its new name
    images.forEach((img) => {
      zip.file(img.newName, img.file)
    })

    // Generate the zip file
    const content = await zip.generateAsync({ type: "blob" })

    // Save the zip file
    saveAs(content, "renamed_images.zip")

    toast({
      title: t("imagesDownloaded"),
      description: t("imagesDownloadedDesc", { count: images.length }),
    })
  }

  // Restablecer todos los nombres a los originales
  const resetAllNames = () => {
    saveToHistory("resetAllNames")

    setImages((prev) =>
      prev.map((img) => ({
        ...img,
        newName: img.originalName,
      })),
    )

    // Limpiar operaciones aplicadas
    setAppliedOperations(new Set())

    toast({
      title: t("namesReset"),
      description: t("namesResetDesc"),
    })
  }

  // Abrir el diálogo para eliminar todos los nombres y empezar de nuevo
  const openResetDialog = () => {
    setResetDialogOpen(true)
  }

  // Eliminar todos los nombres y aplicar numeración serial
  const resetAndApplySerial = () => {
    saveToHistory("resetAndApplySerial")

    // Primero, extraer las extensiones de archivo
    const updatedImages = images.map((img) => {
      const lastDotIndex = img.originalName.lastIndexOf(".")
      const extension = lastDotIndex !== -1 ? img.originalName.substring(lastDotIndex) : ""

      return {
        ...img,
        newName: extension, // Solo mantener la extensión
      }
    })

    setImages(updatedImages)

    // Luego aplicar la numeración serial
    setTimeout(() => {
      addSerialNumbers(resetSerialType, resetSerialStart, resetSerialPadding)
    }, 100)

    setResetDialogOpen(false)

    toast({
      title: t("namesCleared"),
      description: t("namesClearedDesc"),
    })
  }

  return (
    <div className="grid gap-8">
      <FileUploader onFilesAdded={handleFilesAdded} />

      {images.length > 0 && (
        <>
          <RenameOptions
            prefix={prefix}
            setPrefix={setPrefix}
            prefixToRemove={prefixToRemove}
            setPrefixToRemove={setPrefixToRemove}
            suffix={suffix}
            setSuffix={setSuffix}
            suffixToRemove={suffixToRemove}
            setSuffixToRemove={setSuffixToRemove}
            dateFormat={dateFormat}
            setDateFormat={setDateFormat}
            serialStart={serialStart}
            setSerialStart={setSerialStart}
            serialPadding={serialPadding}
            setSerialPadding={setSerialPadding}
            serialType={serialType}
            setSerialType={setSerialType}
            onApplyPrefix={applyPrefix}
            onRemovePrefix={removePrefixFromAll}
            onApplySuffix={applySuffix}
            onRemoveSuffix={removeSuffixFromAll}
            onAddDatePrefix={addDatePrefix}
            onAddDateSuffix={addDateSuffix}
            onAddSerialNumbers={() => addSerialNumbers()}
            onExtractMetadata={extractMetadata}
            onResetAllNames={resetAllNames}
            onClearAllNames={openResetDialog}
            onUndoLastOperation={undoLastOperation}
            canUndo={history.length > 0}
          />

          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">
              {t("images")} ({images.length})
            </h2>
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="icon"
                onClick={() => setViewMode("grid")}
                className="h-8 w-8"
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="icon"
                onClick={() => setViewMode("list")}
                className="h-8 w-8"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <ImageList
            images={images}
            onRemoveImage={handleRemoveImage}
            onEditName={handleEditName}
            onUpdateName={handleUpdateName}
            onReorderImages={reorderImages}
            viewMode={viewMode}
          />

          <div className="flex justify-center mt-4">
            <Button onClick={downloadImages} className="flex items-center gap-2" size="lg">
              <Download className="w-4 h-4" />
              {t("downloadImages")}
            </Button>
          </div>

          {/* Diálogo para eliminar nombres y aplicar serial */}
          <Dialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t("clearAllNames")}</DialogTitle>
                <DialogDescription>{t("clearAllNamesDesc")}</DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="serialType">{t("serialType")}</Label>
                  <RadioGroup
                    id="serialType"
                    value={resetSerialType}
                    onValueChange={(value) => setResetSerialType(value as SerialType)}
                    className="flex space-x-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="numeric" id="numeric" />
                      <Label htmlFor="numeric">{t("numeric")}</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="alphabetic" id="alphabetic" />
                      <Label htmlFor="alphabetic">{t("alphabetic")}</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="resetSerialStart">{t("startingNumber")}</Label>
                    <Input
                      id="resetSerialStart"
                      type="number"
                      min="1"
                      value={resetSerialStart}
                      onChange={(e) => setResetSerialStart(Number.parseInt(e.target.value) || 1)}
                    />
                  </div>

                  {resetSerialType === "numeric" && (
                    <div className="space-y-2">
                      <Label htmlFor="resetSerialPadding">{t("padding")}</Label>
                      <Input
                        id="resetSerialPadding"
                        type="number"
                        min="1"
                        max="10"
                        value={resetSerialPadding}
                        onChange={(e) => setResetSerialPadding(Number.parseInt(e.target.value) || 3)}
                      />
                    </div>
                  )}
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setResetDialogOpen(false)}>
                  {t("cancel")}
                </Button>
                <Button onClick={resetAndApplySerial}>{t("apply")}</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  )
}

