import Map "mo:core/Map";
import Array "mo:core/Array";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";
import Text "mo:core/Text";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";

actor {
  // Types
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

  type StaticStoreContent = {
    heroText : Text;
    heroBanner : Text;
    aboutPageCopy : Text;
  };

  public type UserProfile = {
    name : Text;
    email : Text;
  };

  // Hardcoded admin email
  let ADMIN_EMAIL : Text = "dhimayustudio@gmail.com";

  // Authorization instance
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Track users for admin check
  let userProfiles = Map.empty<Principal, UserProfile>();

  // State variables
  var nextProductId = 1;
  var nextOrderId = 1;

  let products = Map.empty<Nat, Product>();
  let carts = Map.empty<Principal, [CartItem]>();
  let orders = Map.empty<Principal, [Order]>();

  // Static store content management
  var storeContent : StaticStoreContent = {
    heroText = "Welcome to Our Store!";
    heroBanner = "banner.jpg";
    aboutPageCopy = "We are passionate about fashion and quality clothing.";
  };

  /* ------------------------------------- User Management ---------------------------------- */

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
    // If the user's email matches the hardcoded admin email, grant admin role
    if (profile.email == ADMIN_EMAIL) {
      AccessControl.assignRole(accessControlState, caller, caller, #admin);
    };
  };

  /* ----------------------------- Store Initialization (Admin Only) ------------------------ */

  public shared ({ caller }) func initializeStore() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admin can initialize the store");
    };
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

  /* ------------------------------ Product Management (Admin) ------------------------------ */

  public shared ({ caller }) func addProduct(
    name : Text,
    category : Category,
    description : Text,
    price : Float,
    sizes : [Text],
    stock : Nat,
    image : Text,
  ) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admin can add products");
    };
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

  public query func getProducts() : async [Product] {
    products.values().toArray();
  };

  public query func getProductsByCategory(c : Category) : async [Product] {
    products.values().toArray().filter(func(p) { p.category == c });
  };

  public query func getProductById(id : Nat) : async ?Product {
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
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admin can update products");
    };
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
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admin can delete products");
    };
    switch (products.get(id)) {
      case (null) { Runtime.trap("Product not found") };
      case (?_) {
        products.remove(id);
      };
    };
  };

  /* ------------------------------ Cart Management (User) --------------------------------- */

  public shared ({ caller }) func addToCart(productId : Nat, size : Text, quantity : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can manage their cart");
    };
    let newItem : CartItem = { productId; size; quantity };
    let currentCart = switch (carts.get(caller)) {
      case (null) { [] };
      case (?items) { items };
    };

    let updatedCart = currentCart.filter(
      func(item) { item.productId != productId or item.size != size }
    ).concat([newItem]);

    carts.add(caller, updatedCart);
  };

  public shared ({ caller }) func removeFromCart(productId : Nat, size : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can manage their cart");
    };
    switch (carts.get(caller)) {
      case (null) { Runtime.trap("Cart not found") };
      case (?items) {
        let updatedCart = items.filter(
          func(item) { not (item.productId == productId and item.size == size) }
        );
        carts.add(caller, updatedCart);
      };
    };
  };

  public query ({ caller }) func getCart() : async [CartItem] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view their cart");
    };
    switch (carts.get(caller)) {
      case (null) { [] };
      case (?items) { items };
    };
  };

  public shared ({ caller }) func clearCart() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can clear their cart");
    };
    carts.remove(caller);
  };

  /* ------------------------------ Order Management (User) -------------------------------- */

  public shared ({ caller }) func placeOrder(cartItems : [CartItem], totalAmount : Float) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can place orders");
    };
    let orderId = nextOrderId;
    let order : Order = {
      id = orderId;
      userId = caller.toText();
      items = cartItems;
      totalAmount;
      timestamp = Time.now();
      status = "pending";
    };

    let userOrders = switch (orders.get(caller)) {
      case (null) { [] };
      case (?existingOrders) { existingOrders };
    };

    let updatedOrders = userOrders.concat([order]);
    orders.add(caller, updatedOrders);
    nextOrderId += 1;
    orderId;
  };

  public query ({ caller }) func getOrders() : async [Order] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view their orders");
    };
    switch (orders.get(caller)) {
      case (null) { [] };
      case (?userOrders) { userOrders };
    };
  };

  // Admin: view all orders across all users
  public query ({ caller }) func getAllOrders() : async [Order] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admin can view all orders");
    };
    var allOrders : [Order] = [];
    for ((_, userOrders) in orders.entries()) {
      allOrders := allOrders.concat(userOrders);
    };
    allOrders;
  };

  /* ----------------------------------- Content Management (Admin) ----------------------------- */

  public shared ({ caller }) func updateStoreContent(
    heroText : Text,
    heroBanner : Text,
    aboutPageCopy : Text,
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admin can update content");
    };
    storeContent := {
      heroText;
      heroBanner;
      aboutPageCopy;
    };
  };

  public query func getStoreContent() : async StaticStoreContent {
    storeContent;
  };
};
