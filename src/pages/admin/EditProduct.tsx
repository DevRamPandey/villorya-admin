import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RichTextEditor } from "@/components/cms/RichTextEditor";
import { ArrowLeft, Plus, Trash2, Upload, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

const productSchema = z.object({
  title: z.string().min(1, "Title is required"),
  variety: z.string().min(1, "Variety is required"),
  itemForm: z.string().min(1, "Item form is required"),
  dietType: z.string().min(1, "Diet type is required"),
  useBy: z.string().min(1, "Use by date is required"),
  netQuantities: z.array(
    z.object({
      quantity: z.string().min(1, "Quantity is required"),
      price: z.number().min(0, "Price must be positive"),
    })
  ).min(1, "At least one quantity is required"),
  coupons: z.array(
    z.object({
      code: z.string().min(1, "Coupon code is required"),
      discount: z.number().min(0, "Discount must be positive"),
    })
  ),
  images: z.array(z.string()).min(1, "At least one image is required"),
  videos: z.array(z.string()),
  aboutItem: z.string().min(1, "About item is required"),
  technicalDetails: z.array(
    z.object({
      key: z.string(),
      value: z.string(),
    })
  ),
  additionalInfo: z.array(
    z.object({
      key: z.string(),
      value: z.string(),
    })
  ),
  ingredients: z.string(),
  legalDisclaimer: z.string(),
  productDescription: z.string().min(1, "Product description is required"),
});

type ProductForm = z.infer<typeof productSchema>;

export default function EditProduct() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [aboutItemContent, setAboutItemContent] = useState("");

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    setValue,
    reset,
  } = useForm<ProductForm>({
    resolver: zodResolver(productSchema),
  });

  const { fields: quantityFields, append: appendQuantity, remove: removeQuantity } = useFieldArray({
    control,
    name: "netQuantities",
  });

  const { fields: couponFields, append: appendCoupon, remove: removeCoupon } = useFieldArray({
    control,
    name: "coupons",
  });

  const { fields: technicalFields, append: appendTechnical, remove: removeTechnical } = useFieldArray({
    control,
    name: "technicalDetails",
  });

  const { fields: additionalFields, append: appendAdditional, remove: removeAdditional } = useFieldArray({
    control,
    name: "additionalInfo",
  });

  useEffect(() => {
    // Simulate API call to fetch product
    const fetchProduct = async () => {
      setIsLoading(true);
      try {
        // Mock data - replace with actual API call
        const mockProduct = {
          title: "Organic Turmeric Powder",
          variety: "Turmeric",
          itemForm: "Powder",
          dietType: "Vegan",
          useBy: "2026-01-12",
          netQuantities: [
            { quantity: "100g", price: 99 },
            { quantity: "200g", price: 189 },
          ],
          coupons: [{ code: "SAVE10", discount: 10 }],
          images: ["/placeholder.svg"],
          videos: [],
          aboutItem: "<p>High quality organic turmeric</p>",
          technicalDetails: [
            { key: "Weight", value: "200g" },
            { key: "Brand", value: "Tata Sampann" },
          ],
          additionalInfo: [{ key: "ASIN", value: "B079H8D8M6" }],
          ingredients: "Turmeric",
          legalDisclaimer: "Actual product may vary",
          productDescription: "Premium organic turmeric powder",
        };

        reset(mockProduct);
        setAboutItemContent(mockProduct.aboutItem);
      } catch (error) {
        toast.error("Failed to load product");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [id, reset]);

  const onSubmit = async (data: ProductForm) => {
    setIsSubmitting(true);
    try {
      // API call to update product
      console.log({ ...data, aboutItem: aboutItemContent });
      toast.success("Product updated successfully");
      navigate("/admin/products");
    } catch (error) {
      toast.error("Failed to update product");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      // Handle image upload logic
      const imageUrls = Array.from(files).map((file) => URL.createObjectURL(file));
      setValue("images", imageUrls);
    }
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      // Handle video upload logic
      const videoUrls = Array.from(files).map((file) => URL.createObjectURL(file));
      setValue("videos", videoUrls);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-64" />
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/admin/products")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Product</h1>
          <p className="text-muted-foreground">Update product details</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Essential product details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Product Title *</Label>
              <Input id="title" {...register("title")} placeholder="Enter product title" />
              {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="variety">Variety *</Label>
                <Input id="variety" {...register("variety")} placeholder="e.g., Turmeric" />
                {errors.variety && <p className="text-sm text-destructive">{errors.variety.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="itemForm">Item Form *</Label>
                <Input id="itemForm" {...register("itemForm")} placeholder="e.g., Powder" />
                {errors.itemForm && <p className="text-sm text-destructive">{errors.itemForm.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="dietType">Diet Type *</Label>
                <Input id="dietType" {...register("dietType")} placeholder="e.g., Vegan" />
                {errors.dietType && <p className="text-sm text-destructive">{errors.dietType.message}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="useBy">Use By Date *</Label>
              <Input id="useBy" type="date" {...register("useBy")} />
              {errors.useBy && <p className="text-sm text-destructive">{errors.useBy.message}</p>}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Net Quantities & Pricing</CardTitle>
            <CardDescription>Manage sizes and prices</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {quantityFields.map((field, index) => (
              <div key={field.id} className="flex gap-4 items-start">
                <div className="flex-1 space-y-2">
                  <Label>Quantity</Label>
                  <Input {...register(`netQuantities.${index}.quantity`)} placeholder="e.g., 100g" />
                </div>
                <div className="flex-1 space-y-2">
                  <Label>Price (₹)</Label>
                  <Input
                    type="number"
                    {...register(`netQuantities.${index}.price`, { valueAsNumber: true })}
                    placeholder="0.00"
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="mt-8"
                  onClick={() => removeQuantity(index)}
                  disabled={quantityFields.length === 1}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => appendQuantity({ quantity: "", price: 0 })}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Quantity
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Coupons & Discounts</CardTitle>
            <CardDescription>Add applicable coupons</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {couponFields.map((field, index) => (
              <div key={field.id} className="flex gap-4 items-start">
                <div className="flex-1 space-y-2">
                  <Label>Coupon Code</Label>
                  <Input {...register(`coupons.${index}.code`)} placeholder="e.g., SAVE20" />
                </div>
                <div className="flex-1 space-y-2">
                  <Label>Discount (%)</Label>
                  <Input
                    type="number"
                    {...register(`coupons.${index}.discount`, { valueAsNumber: true })}
                    placeholder="0"
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="mt-8"
                  onClick={() => removeCoupon(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => appendCoupon({ code: "", discount: 0 })}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Coupon
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Media</CardTitle>
            <CardDescription>Product images and videos</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="images">Product Images *</Label>
              <div className="flex items-center gap-4">
                <Input
                  id="images"
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="flex-1"
                />
                <Upload className="h-4 w-4 text-muted-foreground" />
              </div>
              {errors.images && <p className="text-sm text-destructive">{errors.images.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="videos">Product Videos</Label>
              <div className="flex items-center gap-4">
                <Input
                  id="videos"
                  type="file"
                  multiple
                  accept="video/*"
                  onChange={handleVideoUpload}
                  className="flex-1"
                />
                <Upload className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>About This Item</CardTitle>
            <CardDescription>Detailed product description with rich formatting</CardDescription>
          </CardHeader>
          <CardContent>
            <RichTextEditor
              value={aboutItemContent}
              onChange={setAboutItemContent}
              placeholder="Describe the product features, benefits, and details..."
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Technical Details</CardTitle>
            <CardDescription>Specifications and technical information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {technicalFields.map((field, index) => (
              <div key={field.id} className="flex gap-4 items-start">
                <div className="flex-1 space-y-2">
                  <Label>Key</Label>
                  <Input {...register(`technicalDetails.${index}.key`)} placeholder="e.g., Weight" />
                </div>
                <div className="flex-1 space-y-2">
                  <Label>Value</Label>
                  <Input {...register(`technicalDetails.${index}.value`)} placeholder="e.g., 200g" />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="mt-8"
                  onClick={() => removeTechnical(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => appendTechnical({ key: "", value: "" })}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Detail
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Additional Information</CardTitle>
            <CardDescription>ASIN, ratings, and other metadata</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {additionalFields.map((field, index) => (
              <div key={field.id} className="flex gap-4 items-start">
                <div className="flex-1 space-y-2">
                  <Label>Key</Label>
                  <Input {...register(`additionalInfo.${index}.key`)} placeholder="e.g., ASIN" />
                </div>
                <div className="flex-1 space-y-2">
                  <Label>Value</Label>
                  <Input {...register(`additionalInfo.${index}.value`)} placeholder="e.g., B079H8D8M6" />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="mt-8"
                  onClick={() => removeAdditional(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => appendAdditional({ key: "", value: "" })}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Information
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Important Information</CardTitle>
            <CardDescription>Ingredients and legal disclaimers</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="ingredients">Ingredients</Label>
              <Textarea
                id="ingredients"
                {...register("ingredients")}
                placeholder="List all ingredients..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="legalDisclaimer">Legal Disclaimer</Label>
              <Textarea
                id="legalDisclaimer"
                {...register("legalDisclaimer")}
                placeholder="Enter legal disclaimer..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Product Description</CardTitle>
            <CardDescription>Main product description</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              {...register("productDescription")}
              placeholder="Enter detailed product description..."
              rows={5}
            />
            {errors.productDescription && (
              <p className="text-sm text-destructive mt-2">{errors.productDescription.message}</p>
            )}
          </CardContent>
        </Card>

        <div className="flex gap-4 justify-end">
          <Button type="button" variant="outline" onClick={() => navigate("/admin/products")}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Update Product
          </Button>
        </div>
      </form>
    </div>
  );
}
