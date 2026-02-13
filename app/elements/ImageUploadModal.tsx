'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import {
  uploadImages,
  getImages,
  deleteImage,
  resetImageState,
} from '@/redux/slice/ImageSlice';
import { RootState } from '@/redux/store';
import { Upload, Trash2, ImageIcon, Check, Loader2, X } from 'lucide-react';
import { toast } from 'sonner';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

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

  const [selected, setSelected] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [uploadQueue, setUploadQueue] = useState<File[]>([]);
  const [deleteConfirm, setDeleteConfirm] = useState<{ 
    open: boolean; 
    filename: string | null; 
    url: string | null 
  }>({ open: false, filename: null, url: null });

  /* Fetch images */
  useEffect(() => {
    if (open) {
      dispatch(getImages());
      setSelected([]);
      setUploadQueue([]);
    }
  }, [open, dispatch]);

  /* Toasts */
  useEffect(() => {
    if (message) {
      toast.success(message);
      dispatch(resetImageState());
    }
    if (error) {
      toast.error(error);
      dispatch(resetImageState());
    }
  }, [message, error, dispatch]);

  /* Auto-upload when files are added to queue */
  useEffect(() => {
    if (uploadQueue.length > 0 && !uploading) {
      handleUploadFiles(uploadQueue);
    }
  }, [uploadQueue, uploading]);

  /* Handle drag events */
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  /* Handle drop */
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const droppedFiles = Array.from(e.dataTransfer.files).filter(file => 
      file.type.startsWith('image/')
    );

    if (droppedFiles.length === 0) {
      toast.error('Please drop image files only');
      return;
    }

    // Add to queue - useEffect will trigger upload
    setUploadQueue(prev => [...prev, ...droppedFiles]);
    toast.success(`${droppedFiles.length} image(s) added to upload queue`);
  }, []);

  /* Handle file input change */
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []).filter(file => 
      file.type.startsWith('image/')
    );

    if (selectedFiles.length > 0) {
      setUploadQueue(prev => [...prev, ...selectedFiles]);
    }
    
    // Reset input
    e.target.value = '';
  };

  /* Upload files */
  const handleUploadFiles = async (files: File[]) => {
    if (files.length === 0) return;

    setUploading(true);
    
    try {
      const fd = new FormData();
      files.forEach((file) => fd.append('images', file));
      
      await dispatch(uploadImages(fd)).unwrap();
      
      // Remove uploaded files from queue
      setUploadQueue(prev => prev.filter(f => !files.includes(f)));
    } catch (err) {
      console.error('Upload failed:', err);
      toast.error('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  /* Remove from queue */
  const removeFromQueue = (index: number) => {
    setUploadQueue(prev => prev.filter((_, i) => i !== index));
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
    setSelected([]);
    onClose();
  };

  /* Delete confirmed */
  const handleDelete = async (filename: string) => {
    try {
      await dispatch(deleteImage(filename)).unwrap();
      const imageToDelete = images.find(img => img.filename === filename);
      if (imageToDelete && selected.includes(imageToDelete.url)) {
        setSelected(selected.filter(url => url !== imageToDelete.url));
      }
    } catch (err) {
      console.error('Delete failed:', err);
    } finally {
      setDeleteConfirm({ open: false, filename: null, url: null });
    }
  };

  /* Format file size */
  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="!max-w-[960px] w-full max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ImageIcon className="w-5 h-5" />
              Image Library (Cloudinary)
            </DialogTitle>
          </DialogHeader>

          {/* Drag & Drop Zone */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`
              relative border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer
              ${dragActive 
                ? 'border-primary bg-primary/10 scale-[1.02]' 
                : 'border-gray-300 hover:border-gray-400 bg-gray-50/50'
              }
              ${uploading ? 'pointer-events-none opacity-60' : ''}
            `}
          >
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileSelect}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              disabled={uploading}
            />
            
            <div className="pointer-events-none">
              <div className={`
                w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center transition-colors
                ${dragActive ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'}
              `}>
                {uploading ? (
                  <Loader2 className="w-8 h-8 animate-spin" />
                ) : (
                  <Upload className="w-8 h-8" />
                )}
              </div>
              
              <p className="text-lg font-medium text-gray-700 mb-1">
                {uploading ? 'Uploading...' : 'Drop images here'}
              </p>
              <p className="text-sm text-gray-500">
                {uploading 
                  ? 'Please wait while we upload your images' 
                  : 'or click to browse from your computer'
                }
              </p>
              <p className="text-xs text-gray-400 mt-2">
                Supports: JPG, PNG, GIF, WebP (Max 10MB each)
              </p>
            </div>
          </div>

          {/* Upload Queue */}
          {uploadQueue.length > 0 && (
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-blue-900">
                  Upload Queue ({uploadQueue.length})
                </h4>
                {uploading && (
                  <span className="text-sm text-blue-600 flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Uploading...
                  </span>
                )}
              </div>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {uploadQueue.map((file, index) => (
                  <div 
                    key={`${file.name}-${index}`}
                    className="flex items-center justify-between bg-white rounded p-2 text-sm"
                  >
                    <div className="flex items-center gap-2 overflow-hidden">
                      <ImageIcon className="w-4 h-4 text-blue-500 shrink-0" />
                      <span className="truncate text-gray-700">{file.name}</span>
                      <span className="text-gray-400 shrink-0">
                        ({formatSize(file.size)})
                      </span>
                    </div>
                    {!uploading && (
                      <button
                        onClick={() => removeFromQueue(index)}
                        className="text-red-500 hover:text-red-700 p-1"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Gallery */}
          <div className="flex-1 overflow-hidden border rounded-lg">
            <div className="h-[300px] overflow-y-auto p-3">
              {loading ? (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-gray-400" />
                    <p className="text-gray-500">Loading images...</p>
                  </div>
                </div>
              ) : images.length === 0 ? (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <ImageIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-gray-500">No images uploaded yet</p>
                    <p className="text-sm text-gray-400 mt-1">
                      Drag and drop images above to upload
                    </p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {images.map((img) => {
                    const isSelected = selected.includes(img.url);

                    return (
                      <div
                        key={img.filename}
                        className={`relative border rounded-lg overflow-hidden group cursor-pointer transition-all
                          ${isSelected ? 'ring-4 ring-primary ring-offset-2' : 'hover:shadow-md'}`}
                        onClick={() => toggleSelect(img.url)}
                      >
                        {/* Image */}
                        <div className="aspect-square relative">
                          <img
                            src={img.url}
                            alt={`Cloudinary image ${img.filename}`}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                          
                          {/* Selected indicator */}
                          {isSelected && (
                            <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                              <Check className="text-white w-8 h-8 bg-primary rounded-full p-1.5" />
                            </div>
                          )}
                          
                          {/* Delete button */}
                          <Button
                            size="icon"
                            variant="secondary"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteConfirm({ 
                                open: true, 
                                filename: img.filename, 
                                url: img.url 
                              });
                            }}
                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 hover:bg-white"
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </Button>
                        </div>

                        {/* Image info */}
                        <div className="p-2 bg-white border-t">
                          <p className="text-xs text-gray-500 truncate">
                            {img.format?.toUpperCase()} • {(img.bytes ? img.bytes / 1024 : 0).toFixed(1)}KB
                          </p>
                          {img.width && img.height && (
                            <p className="text-xs text-gray-400">
                              {img.width}×{img.height}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <DialogFooter className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              {selected.length} image(s) selected
              {multiple && selected.length > 0 && ' • Click to confirm'}
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                className='cursor-pointer'
                onClick={() => {
                  setSelected([]);
                  setUploadQueue([]);
                  onClose();
                }}
              >
                Cancel
              </Button>
              
              {multiple && (
                <Button
                 className='cursor-pointer'
                  onClick={confirmSelection}
                  disabled={!selected.length || loading || uploading}
                >
                  Use Selected ({selected.length})
                </Button>
              )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirm.open} onOpenChange={() => setDeleteConfirm({ open: false, filename: null, url: null })}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-red-600">Delete Image</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-gray-600 mb-3">
              Are you sure you want to delete this image? This action cannot be undone.
            </p>
            {deleteConfirm.url && (
              <div className="border rounded-lg p-2 mb-3">
                <img 
                  src={deleteConfirm.url} 
                  alt="Preview" 
                  className="w-full h-32 object-cover rounded"
                />
              </div>
            )}
          </div>
          <DialogFooter className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setDeleteConfirm({ open: false, filename: null, url: null })}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteConfirm.filename && handleDelete(deleteConfirm.filename)}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}