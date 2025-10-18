import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RichTextEditor } from "@/components/cms/RichTextEditor";
import { ArrowLeft, Plus, Trash2, Upload, Loader2, X, ImageIcon, Video } from "lucide-react";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";

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
  images: z.array(z.string()),
  videos: z.array(z.string()),
  labReports: z.array(
    z.object({
      title: z.string().min(1, "Lab report title is required"),
      description: z.string(),
      file: z.string().min(1, "Lab report file is required"),
    })
  ),
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

export default function AddProduct() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [aboutItemContent, setAboutItemContent] = useState("");
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [videoPreviews, setVideoPreviews] = useState<string[]>([]);
  const [labReportPreviews, setLabReportPreviews] = useState<{ title: string; description: string; file: string; fileName: string }[]>([]);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    setValue,
  } = useForm<ProductForm>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      netQuantities: [{ quantity: "", price: 0 }],
      coupons: [],
      images: [],
      videos: [],
      labReports: [],
      technicalDetails: [{ key: "", value: "" }],
      additionalInfo: [{ key: "", value: "" }],
    },
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

  const { fields: labReportFields, append: appendLabReport, remove: removeLabReport } = useFieldArray({
    control,
    name: "labReports",
  });

  const onSubmit = async (data: ProductForm) => {
    setIsSubmitting(true);
    try {
      const productData = { 
        ...data, 
        aboutItem: aboutItemContent,
        id: Date.now().toString(),
        createdAt: new Date().toISOString()
      };
      
      // Get existing products from localStorage
      const existingProducts = JSON.parse(localStorage.getItem('products') || '[]');
      
      // Add new product
      existingProducts.push(productData);
      
      // Save to localStorage
      localStorage.setItem('products', JSON.stringify(existingProducts));
      
      toast.success("Product created successfully");
      navigate("/admin/products");
    } catch (error) {
      toast.error("Failed to create product");
    } finally {
      setIsSubmitting(false);
    }
  };

  const onError = (errors: any) => {
    const errorFields = Object.keys(errors);
    if (errorFields.length > 0) {
      const firstError = errors[errorFields[0]];
      const fieldName = errorFields[0]
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, (str) => str.toUpperCase())
        .trim();
      
      toast.error(`Please check: ${fieldName}`, {
        description: firstError.message || "This field has an error"
      });
      
      // Show additional errors if multiple
      if (errorFields.length > 1) {
        toast.error(`${errorFields.length - 1} more field(s) need attention`);
      }
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const imageUrls = Array.from(files).map((file) => URL.createObjectURL(file));
      const allImages = [...imagePreviews, ...imageUrls];
      setImagePreviews(allImages);
      setValue("images", allImages);
      toast.success(`${files.length} image(s) added`);
    }
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const videoUrls = Array.from(files).map((file) => URL.createObjectURL(file));
      const allVideos = [...videoPreviews, ...videoUrls];
      setVideoPreviews(allVideos);
      setValue("videos", allVideos);
      toast.success(`${files.length} video(s) added`);
    }
  };

  const removeImage = (index: number) => {
    const newImages = imagePreviews.filter((_, i) => i !== index);
    setImagePreviews(newImages);
    setValue("images", newImages);
    toast.success("Image removed");
  };

  const removeVideo = (index: number) => {
    const newVideos = videoPreviews.filter((_, i) => i !== index);
    setVideoPreviews(newVideos);
    setValue("videos", newVideos);
    toast.success("Video removed");
  };

  const handleLabReportUpload = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0];
    if (file) {
      const fileUrl = URL.createObjectURL(file);
      const currentReports = labReportPreviews;
      const title = (document.getElementById(`labReport-title-${index}`) as HTMLInputElement)?.value || "";
      const description = (document.getElementById(`labReport-description-${index}`) as HTMLTextAreaElement)?.value || "";
      
      const newReport = { title, description, file: fileUrl, fileName: file.name };
      const updatedReports = [...currentReports];
      updatedReports[index] = newReport;
      
      setLabReportPreviews(updatedReports);
      setValue(`labReports.${index}.file`, fileUrl);
      toast.success("Lab report uploaded");
    }
  };

  const handleRemoveLabReport = (index: number) => {
    const newReports = labReportPreviews.filter((_, i) => i !== index);
    setLabReportPreviews(newReports);
    removeLabReport(index);
    toast.success("Lab report removed");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/admin/products")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Add Product</h1>
          <p className="text-muted-foreground">Create a new product</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit, onError)} className="space-y-6">
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
            <CardDescription>Add different sizes and their prices</CardDescription>
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
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <Label htmlFor="images">Product Images</Label>
              <div className="flex items-center gap-4">
                <Input
                  id="images"
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="flex-1"
                />
                <Button type="button" variant="outline" size="icon">
                  <Upload className="h-4 w-4" />
                </Button>
              </div>
              
              {imagePreviews.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
                  {imagePreviews.map((image, index) => (
                    <div
                      key={index}
                      className="relative group rounded-lg overflow-hidden border border-border bg-card hover:shadow-lg transition-all duration-300 animate-scale-in"
                    >
                      <div className="aspect-square relative">
                        <img
                          src={image}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            onClick={() => removeImage(index)}
                            className="hover-scale"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="absolute top-2 left-2 bg-background/80 backdrop-blur-sm px-2 py-1 rounded-md text-xs font-medium">
                        <ImageIcon className="h-3 w-3 inline mr-1" />
                        {index + 1}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Separator />

            <div className="space-y-4">
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
                <Button type="button" variant="outline" size="icon">
                  <Upload className="h-4 w-4" />
                </Button>
              </div>
              
              {videoPreviews.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  {videoPreviews.map((video, index) => (
                    <div
                      key={index}
                      className="relative group rounded-lg overflow-hidden border border-border bg-card hover:shadow-lg transition-all duration-300 animate-scale-in"
                    >
                      <div className="aspect-video relative">
                        <video
                          src={video}
                          controls
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-2 right-2">
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            onClick={() => removeVideo(index)}
                            className="hover-scale shadow-lg"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="absolute bottom-2 left-2 bg-background/80 backdrop-blur-sm px-2 py-1 rounded-md text-xs font-medium">
                        <Video className="h-3 w-3 inline mr-1" />
                        Video {index + 1}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Lab Reports</CardTitle>
            <CardDescription>Upload product lab test reports and certifications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {labReportFields.map((field, index) => (
              <div key={field.id} className="space-y-4 p-4 border rounded-lg">
                <div className="space-y-2">
                  <Label htmlFor={`labReport-title-${index}`}>Report Title *</Label>
                  <Input
                    id={`labReport-title-${index}`}
                    {...register(`labReports.${index}.title`)}
                    placeholder="e.g., Third-Party Lab Test Certificate"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor={`labReport-description-${index}`}>Description</Label>
                  <Textarea
                    id={`labReport-description-${index}`}
                    {...register(`labReports.${index}.description`)}
                    placeholder="Brief description of the lab report..."
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`labReport-file-${index}`}>Upload Report *</Label>
                  <div className="flex items-center gap-4">
                    <Input
                      id={`labReport-file-${index}`}
                      type="file"
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                      onChange={(e) => handleLabReportUpload(e, index)}
                      className="flex-1"
                    />
                    <Button type="button" variant="outline" size="icon">
                      <Upload className="h-4 w-4" />
                    </Button>
                  </div>
                  {labReportPreviews[index] && (
                    <p className="text-sm text-muted-foreground">
                      Uploaded: {labReportPreviews[index].fileName}
                    </p>
                  )}
                </div>

                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => handleRemoveLabReport(index)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Remove Report
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => appendLabReport({ title: "", description: "", file: "" })}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Lab Report
            </Button>
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
            Create Product
          </Button>
        </div>
      </form>
    </div>
  );
}
