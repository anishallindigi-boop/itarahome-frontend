"use client";

import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  CreateShipping,
  GetAllShipping,
  GetSingleShipping,
  UpdateShipping,
  DeleteShipping,
  resetShippingState,
} from "@/redux/slice/ShippingMethodSlice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from 'sonner';
import {
  PlusCircle,
  Search,
  Edit,
  Trash2,
  Truck,
  Package,
  X,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

export default function ShippingMethodsPage() {
  const dispatch = useAppDispatch();

  const {
    shippingMethods,
    loading,
    error,
    message,
    success,
    isupdated,
    isdeleted,
    singleShipping,
  } = useAppSelector((state) => state.shippingmethod);

  // Local state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedShippingId, setSelectedShippingId] = useState<string | null>(
    null
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    estimatedDays: "",
  });

  // Fetch all shipping methods on component mount
  useEffect(() => {
    dispatch(GetAllShipping());
  }, [dispatch]);

  // Handle toast notifications
 useEffect(() => {
  if (success) {
    toast.success(message || "Shipping method created successfully");
    dispatch(resetShippingState());
    setIsFormOpen(false);
    resetForm();
  }

  if (isupdated) {
    toast.success(message || "Shipping method updated successfully");
    dispatch(resetShippingState());
    setIsFormOpen(false);
    resetForm();
  }

  if (isdeleted) {
    toast.success(message || "Shipping method deleted successfully");
    dispatch(resetShippingState());
    setIsDeleteDialogOpen(false);
  }

  if (error) {
    toast.error(error);
    dispatch(resetShippingState());
  }
}, [success, isupdated, isdeleted, error, message, dispatch]);


  // Load shipping method data when editing
  useEffect(() => {
    if (singleShipping && selectedShippingId) {
      setFormData({
        name: singleShipping.name || "",
        description: singleShipping.description || "",
        price: singleShipping.price?.toString() || "",
        estimatedDays: singleShipping.estimatedDays || "",
      });
    }
  }, [singleShipping, selectedShippingId]);

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: "",
      estimatedDays: "",
    });
    setSelectedShippingId(null);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const shippingData = {
      name: formData.name,
      description: formData.description || undefined,
      price: parseFloat(formData.price),
      estimatedDays: formData.estimatedDays,
    };

    if (selectedShippingId) {
      // Update existing shipping method
      dispatch(
        UpdateShipping({
          id: selectedShippingId,
          form: shippingData,
        })
      );
    } else {
      // Create new shipping method
      dispatch(CreateShipping(shippingData));
    }
  };

  const handleEdit = (id: string) => {
    setSelectedShippingId(id);
    dispatch(GetSingleShipping(id));
    setIsFormOpen(true);
  };

  const handleDelete = (id: string) => {
    setSelectedShippingId(id);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedShippingId) {
      dispatch(DeleteShipping(selectedShippingId));
    }
  };

  // Filter shipping methods based on search
const filteredShippingMethods = shippingMethods.filter((method) => {
  const name = method.name?.toLowerCase() || "";
  const description = method.description?.toLowerCase() || "";
  const estimatedDays = method.estimatedDays?.toLowerCase() || "";
  const search = searchTerm.toLowerCase();

  return (
    name.includes(search) ||
    description.includes(search) ||
    estimatedDays.includes(search)
  );
});

  return (
    <div className="container mx-auto py-6 px-4 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Shipping Methods
          </h1>
          <p className="text-muted-foreground">
            Manage your shipping rates and delivery options
          </p>
        </div>
        <Button onClick={() => setIsFormOpen(true)} className="gap-2">
          <PlusCircle className="h-4 w-4" />
          Add Shipping Method
        </Button>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search shipping methods..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Shipping Methods Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Shipping Methods</CardTitle>
          <CardDescription>
            {filteredShippingMethods.length} methods available
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading && !shippingMethods.length ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Est. Delivery</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredShippingMethods.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center py-8 text-muted-foreground"
                      >
                        <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p>No shipping methods found</p>
                        <Button
                          variant="link"
                          onClick={() => setIsFormOpen(true)}
                          className="mt-2"
                        >
                          Add your first shipping method
                        </Button>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredShippingMethods.map((method) => (
                      <TableRow key={method._id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <Truck className="h-4 w-4 text-muted-foreground" />
                            {method.name}
                          </div>
                        </TableCell>
                        <TableCell className="max-w-xs truncate">
                          {method.description || "-"}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="font-mono">
                            ₹{method.price?.toFixed(2)}
                          </Badge>
                        </TableCell>
                        <TableCell>{method.estimatedDays}</TableCell>
                        <TableCell>
                          <Badge
                           
                          >
                            {method.status || "active"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(method._id)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(method._id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Shipping Method Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {selectedShippingId ? "Edit" : "Add"} Shipping Method
            </DialogTitle>
            <DialogDescription>
              {selectedShippingId
                ? "Update the shipping method details below"
                : "Fill in the details to create a new shipping method"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              {/* Name Field */}
              <div className="grid gap-2">
                <Label htmlFor="name">
                  Method Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g., Standard Delivery"
                  required
                />
              </div>

              {/* Description Field */}
              <div className="grid gap-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Brief description of this shipping method"
                  rows={2}
                />
              </div>

              {/* Price Field */}
              <div className="grid gap-2">
                <Label htmlFor="price">
                  Price (₹) <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  required
                />
              </div>

              {/* Estimated Days Field */}
              <div className="grid gap-2">
                <Label htmlFor="estimatedDays">
                  Estimated Delivery <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="estimatedDays"
                  name="estimatedDays"
                  value={formData.estimatedDays}
                  onChange={handleInputChange}
                  placeholder="e.g., 3-5 business days"
                  required
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsFormOpen(false);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>Processing...</>
                ) : selectedShippingId ? (
                  "Update Method"
                ) : (
                  "Create Method"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              shipping method and remove it from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedShippingId(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {loading ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}