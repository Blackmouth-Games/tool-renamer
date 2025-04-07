"use client"

import { useCallback, useState } from "react"
import { useDropzone } from "react-dropzone"
import { Card, CardContent } from "@/components/ui/card"
import { Upload, ImageIcon } from "lucide-react"
import { useTranslations } from "./language-provider"

interface FileUploaderProps {
  onFilesAdded: (files: File[]) => void
}

export function FileUploader({ onFilesAdded }: FileUploaderProps) {
  const { t } = useTranslations()
  const [isDragging, setIsDragging] = useState(false)

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const imageFiles = acceptedFiles.filter((file) => file.type.startsWith("image/"))
      if (imageFiles.length > 0) {
        onFilesAdded(imageFiles)
      }
    },
    [onFilesAdded],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp"],
    },
    multiple: true,
  })

  return (
    <Card className={`border-2 border-dashed ${isDragActive ? "border-primary bg-primary/10" : "border-gray-300"}`}>
      <CardContent {...getRootProps()} className="flex flex-col items-center justify-center p-10 cursor-pointer">
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center gap-4 text-center">
          <div className="p-4 bg-primary/10 rounded-full">
            <Upload className="w-8 h-8 text-primary" />
          </div>
          <div>
            <p className="text-lg font-medium">{t("dragAndDrop")}</p>
            <p className="text-sm text-gray-500 mt-1">{t("clickToSelect")}</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <ImageIcon className="w-4 h-4" />
            <span>{t("imageFormats")}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

