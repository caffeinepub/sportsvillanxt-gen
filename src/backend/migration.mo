import List "mo:core/List";
import Principal "mo:core/Principal";

module {
  public type OldActor = {
    ownershipClaimable : Bool;
    currentOwner : ?Principal;
  };

  public type NewActor = {
    ownershipClaimable : Bool;
    owners : List.List<Principal>;
  };

  public func run(old : OldActor) : NewActor {
    let owners = List.empty<Principal>();
    {
      ownershipClaimable = old.ownershipClaimable;
      owners;
    };
  };
};
