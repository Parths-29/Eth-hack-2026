# How Redress intends to use Arkiv

The pipeline teammate publishes typed entities. Borrower lookup and incident explorer consume GET /verdicts from a service that must perform the Arkiv queries. This branch implements UI filtering and the HTTP boundary; default data is synthetic. To complete the feature, provide actual SDK query code, network config, owned entities and evidence of user-visible reads. Merely connecting an arbitrary HTTP endpoint is insufficient.
