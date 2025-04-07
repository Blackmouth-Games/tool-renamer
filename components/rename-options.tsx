"use client"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Minus, Calendar, Hash, RotateCcw, Undo, FileText, Trash2 } from "lucide-react"
import type { DateFormat, SerialType } from "./image-renamer"
import { useTranslations } from "./language-provider"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"

interface RenameOptionsProps {
  prefix: string
  setPrefix: (prefix: string) => void
  prefixToRemove: string
  setPrefixToRemove: (prefix: string) => void
  suffix: string
  setSuffix: (suffix: string) => void
  suffixToRemove: string
  setSuffixToRemove: (suffix: string) => void
  dateFormat: DateFormat
  setDateFormat: (format: DateFormat) => void
  serialStart: number
  setSerialStart: (start: number) => void
  serialPadding: number
  setSerialPadding: (padding: number) => void
  serialType: SerialType
  setSerialType: (type: SerialType) => void
  onApplyPrefix: () => void
  onRemovePrefix: () => void
  onApplySuffix: () => void
  onRemoveSuffix: () => void
  onAddDatePrefix: () => void
  onAddDateSuffix: () => void
  onAddSerialNumbers: () => void
  onExtractMetadata: () => void
  onResetAllNames: () => void
  onClearAllNames: () => void
  onUndoLastOperation: () => void
  canUndo: boolean
}

export function RenameOptions({
  prefix,
  setPrefix,
  prefixToRemove,
  setPrefixToRemove,
  suffix,
  setSuffix,
  suffixToRemove,
  setSuffixToRemove,
  dateFormat,
  setDateFormat,
  serialStart,
  setSerialStart,
  serialPadding,
  setSerialPadding,
  serialType,
  setSerialType,
  onApplyPrefix,
  onRemovePrefix,
  onApplySuffix,
  onRemoveSuffix,
  onAddDatePrefix,
  onAddDateSuffix,
  onAddSerialNumbers,
  onExtractMetadata,
  onResetAllNames,
  onClearAllNames,
  onUndoLastOperation,
  canUndo,
}: RenameOptionsProps) {
  const { t } = useTranslations()

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle>{t("renameOptions")}</CardTitle>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-8 px-2 flex items-center gap-1" onClick={onResetAllNames}>
            <RotateCcw className="h-3.5 w-3.5" />
            <span>{t("resetAll")}</span>
          </Button>
          <Button variant="outline" size="sm" className="h-8 px-2 flex items-center gap-1" onClick={onClearAllNames}>
            <Trash2 className="h-3.5 w-3.5" />
            <span>{t("clearAll")}</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 px-2 flex items-center gap-1"
            onClick={onUndoLastOperation}
            disabled={!canUndo}
          >
            <Undo className="h-3.5 w-3.5" />
            <span>{t("undo")}</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="prefix">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="prefix">{t("prefix")}</TabsTrigger>
            <TabsTrigger value="suffix">{t("suffix")}</TabsTrigger>
          </TabsList>

          <TabsContent value="prefix" className="space-y-6">
            {/* Prefix Options */}
            <div className="grid gap-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <div className="md:col-span-2">
                  <label htmlFor="prefix" className="text-sm font-medium mb-2 block">
                    {t("addPrefix")}
                  </label>
                  <Input
                    id="prefix"
                    placeholder="Ej: vacaciones2023_"
                    value={prefix}
                    onChange={(e) => setPrefix(e.target.value)}
                  />
                </div>
                <Button onClick={onApplyPrefix} disabled={!prefix} className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  {t("applyPrefix")}
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <div className="md:col-span-2">
                  <label htmlFor="prefixToRemove" className="text-sm font-medium mb-2 block">
                    {t("removePrefix")}
                  </label>
                  <Input
                    id="prefixToRemove"
                    placeholder="Ej: IMG_"
                    value={prefixToRemove}
                    onChange={(e) => setPrefixToRemove(e.target.value)}
                  />
                </div>
                <Button
                  onClick={onRemovePrefix}
                  disabled={!prefixToRemove}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Minus className="w-4 h-4" />
                  {t("removePrefix")}
                </Button>
              </div>
            </div>

            {/* Date Prefix Options */}
            <div className="grid gap-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <div className="md:col-span-2">
                  <label htmlFor="dateFormat" className="text-sm font-medium mb-2 block">
                    {t("dateFormat")}
                  </label>
                  <Select value={dateFormat} onValueChange={(value) => setDateFormat(value as DateFormat)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona formato" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="YYYY-MM-DD">YYYY-MM-DD (2023-12-31)</SelectItem>
                      <SelectItem value="DD-MM-YYYY">DD-MM-YYYY (31-12-2023)</SelectItem>
                      <SelectItem value="YYYYMMDD">YYYYMMDD (20231231)</SelectItem>
                      <SelectItem value="DDMMYYYY">DDMMYYYY (31122023)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={onAddDatePrefix} className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {t("addDatePrefix")}
                </Button>
              </div>
            </div>

            {/* Serial Number Prefix Options */}
            <div className="grid gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="serialType">{t("serialType")}</Label>
                  <RadioGroup
                    id="serialType"
                    value={serialType}
                    onValueChange={(value) => setSerialType(value as SerialType)}
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
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="serialStart">{t("startingNumber")}</Label>
                  <Input
                    id="serialStart"
                    type="number"
                    min="1"
                    value={serialStart}
                    onChange={(e) => setSerialStart(Number.parseInt(e.target.value) || 1)}
                  />
                </div>

                {serialType === "numeric" && (
                  <div className="space-y-2">
                    <Label htmlFor="serialPadding">{t("padding")}</Label>
                    <Input
                      id="serialPadding"
                      type="number"
                      min="1"
                      max="10"
                      value={serialPadding}
                      onChange={(e) => setSerialPadding(Number.parseInt(e.target.value) || 3)}
                    />
                  </div>
                )}
              </div>

              <Button onClick={onAddSerialNumbers} className="flex items-center gap-2 w-auto">
                <Hash className="w-4 h-4" />
                {t("applySerial")}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="suffix" className="space-y-6">
            {/* Suffix Options */}
            <div className="grid gap-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <div className="md:col-span-2">
                  <label htmlFor="suffix" className="text-sm font-medium mb-2 block">
                    {t("addSuffix")}
                  </label>
                  <Input
                    id="suffix"
                    placeholder="Ej: _final"
                    value={suffix}
                    onChange={(e) => setSuffix(e.target.value)}
                  />
                </div>
                <Button onClick={onApplySuffix} disabled={!suffix} className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  {t("applySuffix")}
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <div className="md:col-span-2">
                  <label htmlFor="suffixToRemove" className="text-sm font-medium mb-2 block">
                    {t("removeSuffix")}
                  </label>
                  <Input
                    id="suffixToRemove"
                    placeholder="Ej: _old"
                    value={suffixToRemove}
                    onChange={(e) => setSuffixToRemove(e.target.value)}
                  />
                </div>
                <Button
                  onClick={onRemoveSuffix}
                  disabled={!suffixToRemove}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Minus className="w-4 h-4" />
                  {t("removeSuffix")}
                </Button>
              </div>
            </div>

            {/* Date Suffix Options */}
            <div className="grid gap-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <div className="md:col-span-2">
                  <label htmlFor="dateFormatSuffix" className="text-sm font-medium mb-2 block">
                    {t("dateFormat")}
                  </label>
                  <Select value={dateFormat} onValueChange={(value) => setDateFormat(value as DateFormat)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona formato" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="YYYY-MM-DD">YYYY-MM-DD (2023-12-31)</SelectItem>
                      <SelectItem value="DD-MM-YYYY">DD-MM-YYYY (31-12-2023)</SelectItem>
                      <SelectItem value="YYYYMMDD">YYYYMMDD (20231231)</SelectItem>
                      <SelectItem value="DDMMYYYY">DDMMYYYY (31122023)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={onAddDateSuffix} className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {t("addDateSuffix")}
                </Button>
              </div>
            </div>

            {/* Advanced Options */}
            <div className="grid gap-4">
              <Button onClick={onExtractMetadata} className="flex items-center gap-2 w-auto" variant="outline">
                <FileText className="w-4 h-4" />
                {t("extractMetadata")}
              </Button>
              <p className="text-sm text-muted-foreground">{t("extractMetadataHelp")}</p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

