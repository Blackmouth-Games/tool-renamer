"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Trash2, Edit, Save, X, GripVertical } from "lucide-react"
import Image from "next/image"
import type { ImageFile, ViewMode } from "./image-renamer"
import { useTranslations } from "./language-provider"
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core"
import {
  SortableContext,
  horizontalListSortingStrategy,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable"
import { restrictToParentElement } from "@dnd-kit/modifiers"
import { CSS } from "@dnd-kit/utilities"

interface ImageListProps {
  images: ImageFile[]
  viewMode: ViewMode
  onRemoveImage: (id: string) => void
  onEditName: (id: string, isEditing: boolean) => void
  onUpdateName: (id: string, newName: string) => void
  onReorderImages: (sourceIndex: number, destinationIndex: number) => void
}

// Componente para cada imagen sortable
function SortableImage({
  image,
  viewMode,
  onRemoveImage,
  onEditName,
  onUpdateName,
  editValues,
  setEditValues,
}: {
  image: ImageFile
  viewMode: ViewMode
  onRemoveImage: (id: string) => void
  onEditName: (id: string, isEditing: boolean) => void
  onUpdateName: (id: string, newName: string) => void
  editValues: Record<string, string>
  setEditValues: (values: Record<string, string>) => void
}) {
  const { t } = useTranslations()
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: image.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.8 : 1,
  }

  const handleEditStart = (id: string, currentName: string) => {
    setEditValues({ ...editValues, [id]: currentName })
    onEditName(id, true)
  }

  const handleEditCancel = (id: string) => {
    onEditName(id, false)
  }

  const handleEditSave = (id: string) => {
    onUpdateName(id, editValues[id] || "")
  }

  const handleEditChange = (id: string, value: string) => {
    setEditValues({ ...editValues, [id]: value })
  }

  if (viewMode === "list") {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="grid grid-cols-12 gap-2 items-center p-3 border-b last:border-b-0 hover:bg-muted/30"
        {...attributes}
      >
        <div className="col-span-1 flex justify-center" {...listeners}>
          <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab" />
        </div>
        <div className="col-span-2">
          <div className="relative h-12 w-12 rounded overflow-hidden">
            <Image src={image.preview || "/placeholder.svg"} alt={image.originalName} fill className="object-cover" />
          </div>
        </div>
        <div className="col-span-4 truncate text-sm">{image.originalName}</div>
        <div className="col-span-4">
          {image.isEditing ? (
            <div className="flex items-center gap-2">
              <Input
                value={editValues[image.id] || ""}
                onChange={(e) => handleEditChange(image.id, e.target.value)}
                className="h-8 text-sm"
              />
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEditSave(image.id)}>
                <Save className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEditCancel(image.id)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="truncate text-sm">{image.newName}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 flex-shrink-0"
                onClick={() => handleEditStart(image.id, image.newName)}
              >
                <Edit className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
        <div className="col-span-1 flex justify-end">
          <Button variant="destructive" size="icon" className="h-8 w-8" onClick={() => onRemoveImage(image.id)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    )
  }

  return (
    <Card ref={setNodeRef} style={style} className="overflow-hidden" {...attributes}>
      <div className="relative aspect-square group">
        <div
          {...listeners}
          className="absolute top-2 left-2 z-10 bg-black/50 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity cursor-grab"
        >
          <GripVertical className="h-5 w-5" />
        </div>
        <Image src={image.preview || "/placeholder.svg"} alt={image.originalName} fill className="object-cover" />
      </div>
      <CardContent className="p-4">
        <div className="grid gap-2">
          <div className="flex items-start justify-between gap-2">
            <div className="grid gap-1 overflow-hidden w-full">
              <p className="text-sm font-medium text-gray-500 truncate">
                {t("originalName")}: {image.originalName}
              </p>

              {image.isEditing ? (
                <div className="flex items-center gap-2 mt-1">
                  <Input
                    value={editValues[image.id] || ""}
                    onChange={(e) => handleEditChange(image.id, e.target.value)}
                    className="h-8 text-sm"
                  />
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEditSave(image.id)}>
                    <Save className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEditCancel(image.id)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium truncate flex-grow">
                    {t("newName")}: {image.newName}
                  </p>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 flex-shrink-0"
                    onClick={() => handleEditStart(image.id, image.newName)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
            <Button
              variant="destructive"
              size="icon"
              className="h-8 w-8 flex-shrink-0"
              onClick={() => onRemoveImage(image.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function ImageList({
  images,
  viewMode,
  onRemoveImage,
  onEditName,
  onUpdateName,
  onReorderImages,
}: ImageListProps) {
  const { t } = useTranslations()
  const [editValues, setEditValues] = useState<Record<string, string>>({})

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor),
  )

  if (images.length === 0) {
    return null
  }

  const handleDragEnd = (event: any) => {
    const { active, over } = event

    if (active.id !== over.id) {
      const oldIndex = images.findIndex((img) => img.id === active.id)
      const newIndex = images.findIndex((img) => img.id === over.id)
      onReorderImages(oldIndex, newIndex)
    }
  }

  if (viewMode === "list") {
    return (
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
        modifiers={[restrictToParentElement]}
      >
        <div className="border rounded-md overflow-hidden">
          <div className="bg-muted p-3 grid grid-cols-12 gap-2 font-medium text-sm border-b">
            <div className="col-span-1"></div>
            <div className="col-span-2">{t("preview")}</div>
            <div className="col-span-4">{t("originalName")}</div>
            <div className="col-span-4">{t("newName")}</div>
            <div className="col-span-1"></div>
          </div>

          <SortableContext items={images.map((img) => img.id)} strategy={verticalListSortingStrategy}>
            {images.map((image) => (
              <SortableImage
                key={image.id}
                image={image}
                viewMode={viewMode}
                onRemoveImage={onRemoveImage}
                onEditName={onEditName}
                onUpdateName={onUpdateName}
                editValues={editValues}
                setEditValues={setEditValues}
              />
            ))}
          </SortableContext>
        </div>
      </DndContext>
    )
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
      modifiers={[restrictToParentElement]}
    >
      <SortableContext items={images.map((img) => img.id)} strategy={horizontalListSortingStrategy}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {images.map((image) => (
            <SortableImage
              key={image.id}
              image={image}
              viewMode={viewMode}
              onRemoveImage={onRemoveImage}
              onEditName={onEditName}
              onUpdateName={onUpdateName}
              editValues={editValues}
              setEditValues={setEditValues}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}

