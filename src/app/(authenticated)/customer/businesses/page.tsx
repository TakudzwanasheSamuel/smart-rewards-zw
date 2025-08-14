import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Store, ArrowRight, MapPin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const businesses = [
  {
    id: "biz-001",
    name: "Chicken Inn",
    category: "Fast Food",
    logoUrl: "https://placehold.co/100x100.png",
    distance: "0.5km away",
  },
  {
    id: "biz-002",
    name: "Cafe Nush",
    category: "Restaurant",
    logoUrl: "https://placehold.co/100x100.png",
    distance: "1.2km away",
  },
  {
    id: "biz-003",
    name: "OK Mart",
    category: "Retail",
    logoUrl: "https://placehold.co/100x100.png",
    distance: "2.5km away",
  },
  {
    id: "biz-004",
    name: "The Hardware Hub",
    category: "Hardware",
    logoUrl: "https://placehold.co/100x100.png",
    distance: "3.1km away",
  },
];

export default function BusinessesPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h1 className="text-2xl font-bold font-headline tracking-tight mb-4">
        Explore Businesses
      </h1>
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="relative w-full flex-grow">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search by name..."
                className="pl-8 sm:w-full"
              />
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              <Select>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="food">Fast Food</SelectItem>
                  <SelectItem value="retail">Retail</SelectItem>
                  <SelectItem value="services">Services</SelectItem>
                  <SelectItem value="hardware">Hardware</SelectItem>
                </SelectContent>
              </Select>
              <Select>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Sort by Distance" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="distance">Sort by Distance</SelectItem>
                  <SelectItem value="name">Sort by Name</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {businesses.map((business) => (
              <Link key={business.id} href={`/customer/businesses/${business.id}`} passHref>
                <div className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                  <Image
                    src={business.logoUrl}
                    alt={`${business.name} logo`}
                    width={64}
                    height={64}
                    className="rounded-md"
                    data-ai-hint="business logo"
                  />
                  <div className="flex-grow">
                    <p className="font-semibold">{business.name}</p>
                    <p className="text-sm text-muted-foreground">{business.category}</p>
                    <p className="text-xs text-muted-foreground flex items-center mt-1">
                        <MapPin className="h-3 w-3 mr-1" />
                        {business.distance}
                    </p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground" />
                </div>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
