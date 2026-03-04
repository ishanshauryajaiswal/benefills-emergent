import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { toast } from '../hooks/use-toast';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Star, CheckCircle, ArrowLeft, Leaf, Droplets, Sun } from 'lucide-react';
import { productsAPI } from '../services/api';
import { trackAddToCart } from '../utils/metaPixel';
import LifestyleSection from '../components/LifestyleSection';
import TestimonialSection from '../components/TestimonialSection';

const ProductDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeImageIndex, setActiveImageIndex] = useState(0);

    const images = product?.images || (product?.image ? [product?.image] : []);


    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setLoading(true);
                window.scrollTo(0, 0); // Reset scroll on load
                const response = await productsAPI.getById(id);
                if (response.data) {
                    setProduct(response.data);
                    setActiveImageIndex(0);
                }
            } catch (error) {
                console.error('Error fetching product:', error);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchProduct();
        }
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-theme-primary mb-4"></div>
                <p className="text-gray-600">Loading product...</p>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50">
                <h1 className="text-3xl font-bold mb-4">Product Not Found</h1>
                <p className="text-gray-600 mb-8">The item you are looking for doesn't exist or has been removed.</p>
                <Link to="/shop">
                    <Button className="bg-theme-primary hover:bg-theme-primary-hover text-white">Back to Shop</Button>
                </Link>
            </div>
        );
    }

    const handleAddToCart = () => {
        addToCart(product);
        trackAddToCart({
            id: product.id,
            name: product.name,
            price: product.price,
        });
        toast({
            title: 'Added to cart!',
            description: `${product.name} has been added to your cart.`,
        });
    };

    const discount = product.originalPrice && product.originalPrice > product.price
        ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
        : 0;

    return (
        <div className="min-h-screen bg-gray-50">

            {/* Top Navigation Wrapper */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center text-gray-500 hover:text-theme-primary transition-colors font-medium text-sm w-fit"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                </button>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 lg:gap-8">

                        {/* Left: Image Gallery */}
                        <div className="p-4 md:p-8 flex flex-col items-center justify-center bg-gray-50/50">
                            <div className="relative w-full max-w-md aspect-square rounded-2xl overflow-hidden shadow-sm bg-white mb-4">
                                {product.badge && (
                                    <Badge className="absolute top-4 left-4 z-10 bg-theme-primary text-white text-sm px-3 py-1">
                                        {product.badge}
                                    </Badge>
                                )}
                                <img
                                    src={images[activeImageIndex]}
                                    alt={product.name}
                                    className="w-full h-full object-cover transition-opacity duration-300"
                                />
                            </div>

                            {/* Thumbnails */}
                            {images.length > 1 && (
                                <div className="flex gap-3 justify-center w-full max-w-md overflow-x-auto pb-2 scrollbar-hide">
                                    {images.map((img, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setActiveImageIndex(idx)}
                                            className={`relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-all ${idx === activeImageIndex ? 'border-theme-primary opacity-100' : 'border-transparent opacity-60 hover:opacity-100'}`}
                                        >
                                            <img src={img} alt={`${product.name} view ${idx + 1}`} className="w-full h-full object-cover" />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Right: Product Info Core */}
                        <div className="p-6 md:p-10 flex flex-col justify-center border-l border-gray-100">
                            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4 leading-tight">
                                {product.name}
                            </h1>

                            <div className="flex items-center gap-2 mb-6">
                                <div className="flex">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                                    ))}
                                </div>
                                <span className="text-gray-600 font-medium ml-2">({product.reviews} reviews)</span>
                            </div>

                            <div className="flex items-end gap-3 mb-6">
                                <span className="text-4xl font-bold text-theme-primary">₹{product.price}</span>
                                {discount > 0 && (
                                    <>
                                        <span className="text-xl text-gray-400 line-through mb-1">₹{product.originalPrice}</span>
                                        <Badge variant="outline" className="text-green-600 border-green-600 bg-green-50 mb-1.5 ml-2 px-2 py-0.5">
                                            Save {discount}%
                                        </Badge>
                                    </>
                                )}
                            </div>

                            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                                {product.description}
                            </p>

                            <div className="bg-gray-50 rounded-2xl p-6 mb-8 border border-gray-100">
                                <h3 className="font-semibold text-gray-900 mb-3 block">Key Ingredients:</h3>
                                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {product.ingredients.map((ing, idx) => (
                                        <li key={idx} className="flex items-center text-gray-700">
                                            <CheckCircle className="w-5 h-5 text-theme-primary mr-2 flex-shrink-0" />
                                            {ing}
                                        </li>
                                    ))}
                                </ul>
                                <div className="flex flex-wrap gap-4 mt-5 pt-5 border-t border-gray-200">
                                    <div className="flex items-center text-sm font-medium text-gray-600"><Leaf className="w-4 h-4 mr-2 text-green-600" /> Vegan</div>
                                    <div className="flex items-center text-sm font-medium text-gray-600"><Sun className="w-4 h-4 mr-2 text-yellow-500" /> No Refined Sugar</div>
                                    <div className="flex items-center text-sm font-medium text-gray-600"><Droplets className="w-4 h-4 mr-2 text-blue-500" /> No Preservatives</div>
                                </div>
                            </div>

                            <Button
                                onClick={handleAddToCart}
                                className="w-full bg-theme-primary hover:bg-theme-primary-hover text-white text-lg py-7 rounded-xl shadow-lg hover:shadow-xl transition-all font-bold"
                            >
                                Add to bag
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Why This Works Section (Text only) */}
                {product.benefitTitle && product.benefitDescription && (
                    <div className="mt-12 bg-white rounded-3xl shadow-sm border border-gray-100 p-8 md:p-12 text-center">
                        <div className="max-w-4xl mx-auto">
                            <h2 className="text-sm font-bold tracking-widest text-theme-primary uppercase mb-3">Why This Works</h2>
                            <h3 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-6 leading-tight">
                                {product.benefitTitle}
                            </h3>
                            <p className="text-lg md:text-xl text-gray-600 leading-relaxed">
                                {product.benefitDescription}
                            </p>
                        </div>
                    </div>
                )}

            </div>

            {/* Swipeable Lifestyle Strip */}
            <LifestyleSection />

            {/* Trust / Reviews generic block below */}
            <TestimonialSection
                title="Loved by our Community"
                maxItems={3}
                showStarsHeader={true}
            />

        </div>
    );
};

export default ProductDetail;
