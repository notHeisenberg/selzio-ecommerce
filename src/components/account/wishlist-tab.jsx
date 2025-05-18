"use client";

import { Heart } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function WishlistTab() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Wishlist</CardTitle>
        <CardDescription>
          Products you've saved for later
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-6">
          <Heart className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
          <p className="text-muted-foreground">Your wishlist is empty</p>
        </div>
      </CardContent>
    </Card>
  );
} 