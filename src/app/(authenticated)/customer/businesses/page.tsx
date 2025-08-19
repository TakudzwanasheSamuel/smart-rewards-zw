"use client";

import { useState, useEffect } from "react";
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
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Store, ArrowRight, MapPin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { customerApi } from "@/lib/api";

interface Business {
  user_id: string;
  business_name: string;
  business_category?: string;
  logo_url?: string;
  latitude?: number;
  longitude?: number;
}

export default function BusinessesPage() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [filteredBusinesses, setFilteredBusinesses] = useState<Business[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  useEffect(() => {
    const fetchBusinesses = async () => {
      try {
        const businessesData = await customerApi.getBusinesses();
        setBusinesses(businessesData);
        setFilteredBusinesses(businessesData);
      } catch (error) {
        console.error('Failed to fetch businesses:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBusinesses();
  }, []);

  useEffect(() => {
    let filtered = businesses;

    // Filter by search term
    if (searchTerm.trim() !== "") {
      filtered = filtered.filter(business =>
        business.business_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        business.business_category?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter(business => 
        business.business_category?.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    setFilteredBusinesses(filtered);
  }, [businesses, searchTerm, selectedCategory]);

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
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="food">Fast Food</SelectItem>
                  <SelectItem value="retail">Retail</SelectItem>
                  <SelectItem value="services">Services</SelectItem>
                  <SelectItem value="hardware">Hardware</SelectItem>
                  <SelectItem value="groceries">Groceries</SelectItem>
                  <SelectItem value="entertainment">Entertainment</SelectItem>
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
                        {isLoading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="flex items-center gap-4 p-4 border rounded-lg">
                  <Skeleton className="h-16 w-16 rounded-md" />
                  <div className="flex-grow">
                    <Skeleton className="h-5 w-32 mb-2" />
                    <Skeleton className="h-4 w-24 mb-1" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                  <Skeleton className="h-5 w-5" />
                </div>
              ))
            ) : filteredBusinesses.length === 0 ? (
              <div className="text-center py-12">
                <Store className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No businesses found</h3>
                <p className="text-muted-foreground">
                  {searchTerm || (selectedCategory && selectedCategory !== "all")
                    ? "Try adjusting your search or filters to find businesses."
                    : "There are no businesses in the network yet. Check back soon!"}
                </p>
              </div>
            ) : (
              filteredBusinesses.map((business) => (
                <Link key={business.user_id} href={`/customer/businesses/${business.user_id}`} passHref>
                  <div className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                    <div className="h-16 w-16 bg-primary/10 rounded-md flex items-center justify-center">
                      <Store className="h-8 w-8 text-primary" />
                    </div>
                    <div className="flex-grow">
                      <p className="font-semibold">{business.business_name}</p>
                      <p className="text-sm text-muted-foreground">{business.business_category || "General Business"}</p>
                      <p className="text-xs text-muted-foreground flex items-center mt-1">
                        <MapPin className="h-3 w-3 mr-1" />
                        {business.latitude && business.longitude ? "Location available" : "Contact for location"}
                      </p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                </Link>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
