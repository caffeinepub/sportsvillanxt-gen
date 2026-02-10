module {
  type EmptyActor = {
    ownershipClaimable : Bool;
    currentOwner : ?Principal;
  };

  public func run(old : EmptyActor) : EmptyActor {
    old;
  };
};
