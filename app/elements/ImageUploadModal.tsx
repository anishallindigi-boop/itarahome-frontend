'use client';

import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import {
  uploadImages,
  getImages,
  deleteImage,
  resetImageState,
} from '@/redux/slice/ImageSlice';
import { RootState } from '@/redux/store';
import { Upload, Trash2, ImageIcon, Check } from 'lucide-react';
import { toast } from 'sonner';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Props {
  open: boolean;
  onSelect: (urls: string[]) => void;
  onClose: () => void;
  multiple?: boolean;
}

export default function ImageUploadModal({
  open,
  onSelect,
  onClose,
  multiple = true,
}: Props) {
  const dispatch = useAppDispatch();
  const { images, loading, message, error } = useAppSelector(
    (state: RootState) => state.image
  );

  const [files, setFiles] = useState<File[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; filename: string | null }>({ open: false, filename: null });

  /* Fetch images */
  useEffect(() => {
    if (open) dispatch(getImages());
  }, [open]);

  /* Toasts */
  useEffect(() => {
    if (message) toast.success(message);
    if (error) toast.error(error);
    dispatch(resetImageState());
  }, [message, error]);

  /* Upload */
  const handleUpload = () => {
    if (!files.length) return toast.error('Select images first');

    const fd = new FormData();
    files.forEach((file) => fd.append('images', file));
    dispatch(uploadImages(fd));
    setFiles([]);
  };

  /* Select / deselect */
  const toggleSelect = (url: string) => {
    if (multiple) {
      setSelected((prev) =>
        prev.includes(url)
          ? prev.filter((u) => u !== url)
          : [...prev, url]
      );
    } else {
      onSelect([url]);
      onClose();
    }
  };

  /* Confirm selection */
  const confirmSelection = () => {
    if (!selected.length) return toast.error('Select at least one image');
    onSelect(selected);
    onClose();
  };

  /* Delete confirmed */
  const handleDelete = (filename: string) => {
    dispatch(deleteImage(filename));
    setDeleteConfirm({ open: false, filename: null });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
    <DialogContent className="!max-w-[960px] w-full h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ImageIcon className="w-5 h-5" />
            Image Library
          </DialogTitle>
        </DialogHeader>

        {/* Upload */}
        <div className="flex gap-4">
          <Input
            type="file"
            multiple
            onChange={(e) => setFiles(Array.from(e.target.files || []))}
          />
          <Button onClick={handleUpload}>
            <Upload className="w-4 h-4 mr-2" />
            Upload
          </Button>
        </div>

        {/* Gallery */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 max-h-[700px] overflow-y-auto mt-4">
          {images.map((img) => {
            const isSelected = selected.includes(img.url);

            return (
              <div
                key={img.filename}
                onClick={() => toggleSelect(img.url)}
                className={`relative border rounded-lg cursor-pointer overflow-hidden group
                  ${isSelected ? 'ring-4 ring-black' : ''}`}
              >
                <img
                  src={`${process.env.NEXT_PUBLIC_API_URL}${img.url}`}
                  alt=""
                  className="w-full h-full object-cover"
                />

                {/* Selected overlay */}
                {isSelected && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <Check className="text-white w-7 h-7" />
                  </div>
                )}

                {/* Delete */}
                <Button
                  size="icon"
                  variant="secondary"
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeleteConfirm({ open: true, filename: img.filename });
                  }}
                  className="absolute top-1 right-1 opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="w-4 h-4 text-red-600" />
                </Button>
              </div>
            );
          })}
        </div>

        {/* Delete confirmation dialog */}
        <Dialog open={deleteConfirm.open} onOpenChange={() => setDeleteConfirm({ open: false, filename: null })}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>Are you sure?</DialogTitle>
            </DialogHeader>
            <p className="py-4 text-sm text-muted-foreground">
              This action cannot be undone.
            </p>
            <DialogFooter className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setDeleteConfirm({ open: false, filename: null })}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleDelete(deleteConfirm.filename!)}
              >
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Footer */}
        <DialogFooter className="flex justify-between items-center">
          <p className="text-sm text-muted-foreground">
            {selected.length} selected
          </p>

          <Button
            onClick={confirmSelection}
            disabled={!selected.length}
          >
            Use Selected
          </Button>
        </DialogFooter>

        {loading && (
          <p className="text-center text-sm text-muted-foreground">
            Processing...
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}
