"use client";

import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Heading } from "@/components/ui/heading";

import { CartDrawer } from "./_cart/cart-drawer";
import { CartSection } from "./_cart/cart-section";
import { CategoryFilterList } from "./_products/category-filter-list";
import { CreateProductDrawer } from "./_products/create-product-drawer";
import { ProductList } from "./_products/product-list";
import { SearchProduct } from "./_products/search-product";
import { UpdateStockDrawer } from "./_products/update-stock-drawer";

export default function Home() {
  return (
    <div className="max-height-screen relative grid size-full grid-cols-12 gap-6">
      <div className="max-height-screen col-span-12 flex h-full flex-col md:col-span-8">
        <div className="flex justify-between">
          <Heading variant="h2" className="mb-3">
            Products
          </Heading>
          <div>
            <Drawer>
              <DrawerTrigger asChild>
                <Button variant="default" size={"sm"}>
                  Actions
                </Button>
              </DrawerTrigger>
              <DrawerContent>
                <div className="mx-auto flex w-full max-w-md flex-col overflow-auto rounded-t-[10px] p-4">
                  <DrawerHeader>
                    <DrawerTitle>Actions</DrawerTitle>
                  </DrawerHeader>
                  <div className="flex gap-4 p-4 pb-0">
                    <UpdateStockDrawer />
                    <CreateProductDrawer />
                  </div>
                </div>
              </DrawerContent>
            </Drawer>
          </div>
        </div>
        <SearchProduct className="mb-4" />
        <CategoryFilterList />
        <ProductList />
        <div className="block p-4 md:hidden">
          <CartDrawer />
        </div>
      </div>
      <div className="max-height-screen col-span-4 hidden flex-col md:flex">
        <Heading variant="h2">Cart</Heading>
        <CartSection />
      </div>
    </div>
  );
}
