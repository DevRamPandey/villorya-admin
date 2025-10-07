import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";
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
import { Separator } from "@/components/ui/separator";

interface ProductDetail {
  id: string;
  title: string;
  variety: string;
  itemForm: string;
  dietType: string;
  useBy: string;
  netQuantities: { quantity: string; price: number }[];
  coupons: { code: string; discount: number }[];
  images: string[];
  videos: string[];
  aboutItem: string;
  technicalDetails: { key: string; value: string }[];
  additionalInfo: { key: string; value: string }[];
  ingredients: string;
  legalDisclaimer: string;
  productDescription: string;
}

export default function ProductDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [product, setProduct] = useState<ProductDetail | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      setIsLoading(true);
      try {
        // Mock data - replace with actual API call
        const mockProduct: ProductDetail = {
          id: "1",
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
          aboutItem: "<p>High quality organic turmeric with numerous health benefits.</p>",
          technicalDetails: [
            { key: "Weight", value: "200 Kilograms" },
            { key: "Brand", value: "Tata Sampann" },
            { key: "Specialty", value: "No Preservative" },
            { key: "Form", value: "Powder" },
            { key: "Package Information", value: "Bag" },
          ],
          additionalInfo: [
            { key: "ASIN", value: "B079H8D8M6" },
            { key: "Customer Reviews", value: "4.5 out of 5 stars" },
            { key: "Best Sellers Rank", value: "#63 in Grocery & Gourmet Foods" },
          ],
          ingredients: "Turmeric",
          legalDisclaimer: "Actual product packaging and materials may contain more information.",
          productDescription: "Tata Sampann's range of spices are crafted not just to satisfy your taste buds but also to take care of your health.",
        };

        setProduct(mockProduct);
      } catch (error) {
        toast.error("Failed to load product details");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleDelete = () => {
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    toast.success("Product deleted successfully");
    navigate("/admin/products");
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-96" />
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <p className="text-lg text-muted-foreground">Product not found</p>
        <Button onClick={() => navigate("/admin/products")} className="mt-4">
          Back to Products
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/admin/products")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{product.title}</h1>
            <p className="text-muted-foreground">Product details and information</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate(`/admin/products/edit/${id}`)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Button variant="outline" onClick={handleDelete}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {(product.images.length > 0 || product.videos.length > 0) && (
          <Card>
            <CardHeader>
              <CardTitle>Product Media</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {product.images.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-3">Images</p>
                  <div className="grid grid-cols-2 gap-4">
                    {product.images.map((image, idx) => (
                      <div key={idx} className="aspect-square overflow-hidden rounded-lg bg-muted">
                        <img src={image} alt={`Product ${idx + 1}`} className="h-full w-full object-cover" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {product.videos.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-3">Videos</p>
                  <div className="grid grid-cols-1 gap-4">
                    {product.videos.map((video, idx) => (
                      <div key={idx} className="aspect-video overflow-hidden rounded-lg bg-muted">
                        <video src={video} controls className="h-full w-full object-cover" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Badge>{product.variety}</Badge>
              <Badge>{product.itemForm}</Badge>
              <Badge>{product.dietType}</Badge>
            </div>
            <Separator />
            <div className="space-y-2">
              <p className="text-sm font-medium">Use By Date</p>
              <p className="text-muted-foreground">{new Date(product.useBy).toLocaleDateString()}</p>
            </div>
            <Separator />
            <div className="space-y-2">
              <p className="text-sm font-medium">Available Quantities & Prices</p>
              <div className="flex flex-wrap gap-2">
                {product.netQuantities.map((nq, idx) => (
                  <Badge key={idx} variant="outline">
                    {nq.quantity}: ₹{nq.price}
                  </Badge>
                ))}
              </div>
            </div>
            {product.coupons.length > 0 && (
              <>
                <Separator />
                <div className="space-y-2">
                  <p className="text-sm font-medium">Available Coupons</p>
                  <div className="flex flex-wrap gap-2">
                    {product.coupons.map((coupon, idx) => (
                      <Badge key={idx} variant="secondary">
                        {coupon.code}: {coupon.discount}% OFF
                      </Badge>
                    ))}
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>About This Item</CardTitle>
        </CardHeader>
        <CardContent>
          <div dangerouslySetInnerHTML={{ __html: product.aboutItem }} className="prose prose-sm max-w-none dark:prose-invert" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Product Description</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground whitespace-pre-wrap">{product.productDescription}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Technical Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            {product.technicalDetails.map((detail, idx) => (
              <div key={idx} className="flex justify-between py-2 border-b border-border last:border-0">
                <span className="font-medium">{detail.key}</span>
                <span className="text-muted-foreground">{detail.value}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Additional Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            {product.additionalInfo.map((info, idx) => (
              <div key={idx} className="flex justify-between py-2 border-b border-border last:border-0">
                <span className="font-medium">{info.key}</span>
                <span className="text-muted-foreground">{info.value}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Important Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm font-medium mb-2">Ingredients:</p>
            <p className="text-muted-foreground">{product.ingredients}</p>
          </div>
          <Separator />
          <div>
            <p className="text-sm font-medium mb-2">Legal Disclaimer:</p>
            <p className="text-muted-foreground text-sm">{product.legalDisclaimer}</p>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the product.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
