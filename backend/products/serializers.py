from rest_framework import serializers
from .models import Category, Product, Sale

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = "__all__"

class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = "__all__"

class SaleSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source="product.name", read_only=True)

    class Meta:
        model = Sale
        fields = "__all__"

    def validate(self, attrs):
        product = attrs["product"]
        quantity = attrs["quantity"]
        if quantity <= 0:
            raise serializers.ValidationError("Quantity must be greater than zero.")
        if product.stock < quantity:
            raise serializers.ValidationError("Not enough stock.")
        return attrs

    def create(self, validated_data):
        product = validated_data["product"]
        quantity = validated_data["quantity"]
        if "total_price" not in validated_data:
            validated_data["total_price"] = product.price * quantity
        sale = Sale.objects.create(**validated_data)
        product.stock -= quantity
        product.save(update_fields=["stock", "updated_at"])
        return sale
