# Embedded Messages in User Document

We store anonymous messages as embedded subdocuments inside the MongoDB User document rather than in a separate referenced messages collection. This colocation minimizes database lookups when fetching a user's inbox on the dashboard and ensures atomic cascading deletion when an account is removed, with reverse chronological sorting managed via MongoDB aggregation pipelines.
