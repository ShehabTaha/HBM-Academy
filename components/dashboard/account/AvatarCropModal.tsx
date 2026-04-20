"use client";

import React, { useState, useRef, useCallback } from "react";
import ReactCrop, { Crop, PixelCrop, centerCrop, makeAspectCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Loader2, RotateCw, ZoomIn, ZoomOut, Save, X } from "lucide-react";

interface AvatarCropModalProps {
  isOpen: boolean;
  imageFile: File | null;
  onSave: (croppedBlob: Blob) => Promise<void>;
  onCancel: () => void;
}

function centerAspectCrop(
  mediaWidth: number,
  mediaHeight: number,
  aspect: number
): Crop {
  return centerCrop(
    makeAspectCrop({ unit: "%", width: 80 }, aspect, mediaWidth, mediaHeight),
    mediaWidth,
    mediaHeight
  );
}

export function AvatarCropModal({
  isOpen,
  imageFile,
  onSave,
  onCancel,
}: AvatarCropModalProps) {
  const [imgSrc, setImgSrc] = useState<string>("");
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [scale, setScale] = useState(1);
  const [rotate, setRotate] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

  const imgRef = useRef<HTMLImageElement>(null);
  const prevObjectUrl = useRef<string>("");

  // Load the file into a data URL when it changes
  React.useEffect(() => {
    if (!imageFile) return;
    if (prevObjectUrl.current) URL.revokeObjectURL(prevObjectUrl.current);
    const url = URL.createObjectURL(imageFile);
    prevObjectUrl.current = url;
    setImgSrc(url);
    setScale(1);
    setRotate(0);
    setCrop(undefined);
    setCompletedCrop(undefined);
  }, [imageFile]);

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      if (prevObjectUrl.current) URL.revokeObjectURL(prevObjectUrl.current);
    };
  }, []);

  const onImageLoad = useCallback(
    (e: React.SyntheticEvent<HTMLImageElement>) => {
      const { width, height } = e.currentTarget;
      const initial = centerAspectCrop(width, height, 1);
      setCrop(initial);
    },
    []
  );

  const handleSave = async () => {
    if (!completedCrop || !imgRef.current) return;
    setIsSaving(true);
    try {
      const blob = await getCroppedBlob(
        imgRef.current,
        completedCrop,
        scale,
        rotate
      );
      if (!blob) throw new Error("Failed to process image");
      await onSave(blob);
    } catch (err) {
      console.error("[AvatarCropModal] Error saving:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleEscapeKey = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        onCancel();
      }
    },
    [onCancel]
  );

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onCancel();
      }}
    >
      <DialogContent
        className="sm:max-w-lg p-0 overflow-hidden"
        onKeyDown={handleEscapeKey}
      >
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle>Crop Profile Picture</DialogTitle>
          <DialogDescription>
            Drag and resize the circle to crop your photo. Use the controls below to zoom or rotate.
          </DialogDescription>
        </DialogHeader>

        {/* Crop Area */}
        <div className="flex items-center justify-center bg-gray-950 min-h-[280px] max-h-[360px] overflow-hidden">
          {imgSrc ? (
            <ReactCrop
              crop={crop}
              onChange={(_, percentCrop) => setCrop(percentCrop)}
              onComplete={(c) => setCompletedCrop(c)}
              aspect={1}
              circularCrop
              className="max-h-[340px]"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                ref={imgRef}
                src={imgSrc}
                alt="Crop preview"
                onLoad={onImageLoad}
                style={{
                  transform: `scale(${scale}) rotate(${rotate}deg)`,
                  maxHeight: "340px",
                  maxWidth: "100%",
                  objectFit: "contain",
                  transition: "transform 0.15s ease",
                }}
              />
            </ReactCrop>
          ) : (
            <div className="flex items-center justify-center h-[280px]">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 space-y-4">
          {/* Zoom */}
          <div className="flex items-center gap-3">
            <ZoomOut className="h-4 w-4 text-gray-400 shrink-0" />
            <Slider
              min={0.5}
              max={3}
              step={0.05}
              value={[scale]}
              onValueChange={([v]) => setScale(v)}
              className="flex-1"
            />
            <ZoomIn className="h-4 w-4 text-gray-400 shrink-0" />
            <span className="text-xs text-gray-500 w-10 text-right tabular-nums">
              {Math.round(scale * 100)}%
            </span>
          </div>

          {/* Rotate */}
          <div className="flex items-center gap-3">
            <RotateCw className="h-4 w-4 text-gray-400 shrink-0" />
            <Slider
              min={-180}
              max={180}
              step={1}
              value={[rotate]}
              onValueChange={([v]) => setRotate(v)}
              className="flex-1"
            />
            <span className="text-xs text-gray-500 w-10 text-right tabular-nums">
              {rotate}°
            </span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs text-gray-500"
              onClick={() => setRotate(0)}
            >
              Reset
            </Button>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex gap-3 px-6 pb-6 pt-2">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={onCancel}
            disabled={isSaving}
          >
            <X className="mr-2 h-4 w-4" />
            Cancel
          </Button>
          <Button
            type="button"
            className="flex-1"
            onClick={handleSave}
            disabled={!completedCrop || isSaving}
          >
            {isSaving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Save Avatar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Canvas helper ────────────────────────────────────────────────────────────

async function getCroppedBlob(
  image: HTMLImageElement,
  pixelCrop: PixelCrop,
  scale: number,
  rotate: number
): Promise<Blob | null> {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;

  const outputSize = Math.min(pixelCrop.width * scaleX, pixelCrop.height * scaleY);
  canvas.width = outputSize;
  canvas.height = outputSize;

  ctx.save();
  ctx.translate(outputSize / 2, outputSize / 2);
  ctx.rotate((rotate * Math.PI) / 180);
  ctx.scale(scale, scale);
  ctx.translate(-outputSize / 2, -outputSize / 2);

  ctx.drawImage(
    image,
    pixelCrop.x * scaleX,
    pixelCrop.y * scaleY,
    pixelCrop.width * scaleX,
    pixelCrop.height * scaleY,
    0,
    0,
    outputSize,
    outputSize
  );
  ctx.restore();

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Canvas is empty"))),
      "image/webp",
      0.92
    );
  });
}
