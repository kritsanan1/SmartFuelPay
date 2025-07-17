

  // Only show navigation on desktop for admin routes or mobile always
  const shouldShowNav = location.startsWith("/admin") || window.innerWidth < 768;

  if (!shouldShowNav && window.innerWidth >= 768) {
    return null;
  }

  return (
    <>
      {/* Mobile Navigation */}
      <div className="lg:hidden">
        <div className="fixed top-4 left-4 z-50">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="bg-white/90 backdrop-blur-sm">
                <Menu className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72">
              <div className="flex items-center space-x-2 mb-6">
                <Fuel className="h-6 w-6" />
                <h2 className="text-lg font-semibold">Fuel Station</h2>
              </div>
              <NavItems />
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Desktop Navigation - Only for admin */}
      {location.startsWith("/admin") && (
        <div className="hidden lg:block fixed top-4 left-4 z-50">
          <div className="bg-white/90 backdrop-blur-sm border rounded-lg p-4 w-64">
            <div className="flex items-center space-x-2 mb-4">
              <Fuel className="h-5 w-5" />
              <h2 className="font-semibold">Fuel Station</h2>
            </div>
            <NavItems />
          </div>
        </div>
      )}
    </>
  );
}