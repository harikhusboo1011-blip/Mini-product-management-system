from rest_framework import viewsets, filters
from .models import Category, Product, Sale
from .serializers import CategorySerializer, ProductSerializer, SaleSerializer

class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all().order_by("name")
    serializer_class = CategorySerializer

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all().order_by("-created_at")
    serializer_class = ProductSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ["name", "description"]

class SaleViewSet(viewsets.ModelViewSet):
    queryset = Sale.objects.all().order_by("-sold_at")
    serializer_class = SaleSerializer
