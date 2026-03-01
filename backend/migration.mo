import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Text "mo:core/Text";

module {
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

  type OldActor = {
    nextProductId : Nat;
    nextOrderId : Nat;
    products : Map.Map<Nat, Product>;
    carts : Map.Map<Text, [CartItem]>;
    orders : Map.Map<Text, [Order]>;
  };

  type NewActor = {
    nextProductId : Nat;
    nextOrderId : Nat;
    products : Map.Map<Nat, Product>;
    carts : Map.Map<Text, [CartItem]>;
    orders : Map.Map<Text, [Order]>;
  };

  public func run(old : OldActor) : NewActor {
    old;
  };
};
