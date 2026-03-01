import Map "mo:core/Map";
import Array "mo:core/Array";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import Nat "mo:core/Nat";
import Text "mo:core/Text";



actor {
  type Category = {
    #femaleDresses;
    #maleShirts;
    #maleTshirts;
    #kidsApparel;
  };

  type Product = {
    id : Nat;
    name : Text;
    category : Category;
    description : Text;
    price : Float;
    sizes : [Text];
    stock : Nat;
    image : Text;
  };

  type CartItem = {
    productId : Nat;
    size : Text;
    quantity : Nat;
  };

  type Order = {
    id : Nat;
    userId : Text;
    items : [CartItem];
    totalAmount : Float;
    timestamp : Int;
    status : Text;
  };

  var nextProductId = 1;
  var nextOrderId = 1;

  let products = Map.empty<Nat, Product>();
  let carts = Map.empty<Text, [CartItem]>();
  let orders = Map.empty<Text, [Order]>();

  public shared ({ caller }) func initializeStore() : async () {
    if (products.size() > 0) {
      Runtime.trap("Store already initialized");
    };

    let femaleProducts = [
      {
        id = nextProductId;
        name = "Elegant Floral Dress";
        category = #femaleDresses;
        description = "A beautiful floral dress for special occasions.";
        price = 59.99;
        sizes = ["S", "M", "L"];
        stock = 10;
        image = "floral_dress.jpg";
      },
      {
        id = nextProductId + 1;
        name = "Casual Summer Dress";
        category = #femaleDresses;
        description = "Light and breezy summer dress.";
        price = 39.99;
        sizes = ["XS", "S", "M", "L"];
        stock = 15;
        image = "summer_dress.jpg";
      },
      {
        id = nextProductId + 2;
        name = "Classic Little Black Dress";
        category = #femaleDresses;
        description = "Timeless classic for any event.";
        price = 79.99;
        sizes = ["S", "M", "L", "XL"];
        stock = 8;
        image = "black_dress.jpg";
      },
    ];

    let maleShirtsProducts = [
      {
        id = nextProductId + 3;
        name = "Formal White Shirt";
        category = #maleShirts;
        description = "Perfect for business meetings and formal events.";
        price = 49.99;
        sizes = ["M", "L", "XL"];
        stock = 12;
        image = "white_shirt.jpg";
      },
      {
        id = nextProductId + 4;
        name = "Casual Plaid Shirt";
        category = #maleShirts;
        description = "Comfortable and stylish plaid design.";
        price = 29.99;
        sizes = ["S", "M", "L"];
        stock = 20;
        image = "plaid_shirt.jpg";
      },
      {
        id = nextProductId + 5;
        name = "Denim Shirt";
        category = #maleShirts;
        description = "Classic denim shirt for a rugged look.";
        price = 59.99;
        sizes = ["M", "L", "XL"];
        stock = 10;
        image = "denim_shirt.jpg";
      },
    ];

    let maleTshirtsProducts = [
      {
        id = nextProductId + 6;
        name = "Graphic T-Shirt";
        category = #maleTshirts;
        description = "Trendy t-shirt with unique graphic design.";
        price = 19.99;
        sizes = ["S", "M", "L"];
        stock = 25;
        image = "graphic_tshirt.jpg";
      },
      {
        id = nextProductId + 7;
        name = "V-Neck T-Shirt";
        category = #maleTshirts;
        description = "Comfortable v-neck for everyday wear.";
        price = 24.99;
        sizes = ["M", "L", "XL"];
        stock = 18;
        image = "vneck_tshirt.jpg";
      },
      {
        id = nextProductId + 8;
        name = "Classic Crew Neck";
        category = #maleTshirts;
        description = "Versatile and stylish crew neck.";
        price = 14.99;
        sizes = ["S", "M", "L"];
        stock = 30;
        image = "crew_neck.jpg";
      },
    ];

    let kidsApparelProducts = [
      {
        id = nextProductId + 9;
        name = "Girls' Party Dress";
        category = #kidsApparel;
        description = "Adorable party dress for girls.";
        price = 24.99;
        sizes = ["2T", "3T", "4T"];
        stock = 14;
        image = "girls_party_dress.jpg";
      },
      {
        id = nextProductId + 10;
        name = "Boys' Polo Shirt";
        category = #kidsApparel;
        description = "Smart and comfortable polo shirt.";
        price = 14.99;
        sizes = ["XS", "S", "M"];
        stock = 17;
        image = "boys_polo_shirt.jpg";
      },
      {
        id = nextProductId + 11;
        name = "Unisex Hoodie";
        category = #kidsApparel;
        description = "Warm and stylish hoodie for kids.";
        price = 19.99;
        sizes = ["XS", "S", "M", "L"];
        stock = 12;
        image = "kids_hoodie.jpg";
      },
    ];

    let allProducts = femaleProducts.concat(maleShirtsProducts).concat(maleTshirtsProducts).concat(
      kidsApparelProducts,
    );

    let entries = allProducts.map(
      func(product) {
        (product.id, product);
      }
    );

    let productsMap = Map.fromIter<Nat, Product>(entries.values());
    for ((id, product) in productsMap.entries()) {
      products.add(id, product);
    };

    nextProductId += allProducts.size();
    assert (products.keys().toArray().size() == 12);
  };

  public shared ({ caller }) func addProduct(
    name : Text,
    category : Category,
    description : Text,
    price : Float,
    sizes : [Text],
    stock : Nat,
    image : Text,
  ) : async Nat {
    let productId = nextProductId;
    let product : Product = {
      id = productId;
      name;
      category;
      description;
      price;
      sizes;
      stock;
      image;
    };

    products.add(productId, product);
    nextProductId += 1;
    productId;
  };

  public query ({ caller }) func getProducts() : async [Product] {
    products.values().toArray();
  };

  public query ({ caller }) func getProductsByCategory(c : Category) : async [Product] {
    products.values().toArray().filter(func(p) { p.category == c });
  };

  public query ({ caller }) func getProductById(id : Nat) : async ?Product {
    products.get(id);
  };

  public shared ({ caller }) func updateProduct(
    id : Nat,
    name : Text,
    category : Category,
    description : Text,
    price : Float,
    sizes : [Text],
    stock : Nat,
    image : Text,
  ) : async () {
    switch (products.get(id)) {
      case (null) { Runtime.trap("Product not found") };
      case (?_) {
        let updatedProduct : Product = {
          id;
          name;
          category;
          description;
          price;
          sizes;
          stock;
          image;
        };
        products.add(id, updatedProduct);
      };
    };
  };

  public shared ({ caller }) func deleteProduct(id : Nat) : async () {
    switch (products.get(id)) {
      case (null) { Runtime.trap("Product not found") };
      case (?_) {
        products.remove(id);
      };
    };
  };

  public shared ({ caller }) func addToCart(userId : Text, productId : Nat, size : Text, quantity : Nat) : async () {
    let newItem : CartItem = { productId; size; quantity };
    let currentCart = switch (carts.get(userId)) {
      case (null) { [] };
      case (?items) { items };
    };

    let updatedCart = currentCart.filter(
      func(item) { item.productId != productId or item.size != size }
    ).concat([newItem]);

    carts.add(userId, updatedCart);
  };

  public shared ({ caller }) func removeFromCart(userId : Text, productId : Nat, size : Text) : async () {
    switch (carts.get(userId)) {
      case (null) { Runtime.trap("Cart not found") };
      case (?items) {
        let updatedCart = items.filter(
          func(item) { not (item.productId == productId and item.size == size) }
        );
        carts.add(userId, updatedCart);
      };
    };
  };

  public query ({ caller }) func getCart(userId : Text) : async [CartItem] {
    switch (carts.get(userId)) {
      case (null) { [] };
      case (?items) { items };
    };
  };

  public shared ({ caller }) func clearCart(userId : Text) : async () {
    carts.remove(userId);
  };

  public shared ({ caller }) func placeOrder(userId : Text, cartItems : [CartItem], totalAmount : Float) : async Nat {
    let orderId = nextOrderId;
    let order : Order = {
      id = orderId;
      userId;
      items = cartItems;
      totalAmount;
      timestamp = Time.now();
      status = "pending";
    };

    let userOrders = switch (orders.get(userId)) {
      case (null) { [] };
      case (?existingOrders) { existingOrders };
    };

    let updatedOrders = userOrders.concat([order]);
    orders.add(userId, updatedOrders);
    nextOrderId += 1;
    orderId;
  };

  public query ({ caller }) func getOrders(userId : Text) : async [Order] {
    switch (orders.get(userId)) {
      case (null) { [] };
      case (?userOrders) { userOrders };
    };
  };
};
