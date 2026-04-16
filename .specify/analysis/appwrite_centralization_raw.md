I've noticed a lot of logic got mengled between our latest specs and i would like to create a new spec to organize the code.

There are somethings that got confused by you and this made the code look weird and not mantainable by a human as it should be.

Lets start by "centralizing appwrite logic".
Yes, we have a appwrite packages. But our appwrite logic are actually scattered across the package and the migrator.

Here's what i actually meant when i first required this.
EVERYTHING related to appwrite should be in the appwrite package.
ABSOLUTELY EVERYTHING.

So, i expect the package to have:
- database / table definitions (think of it as a drizzle schema, but for appwrite, using appwrite's sdk)
- Aligned with the table definitions, the package should have:
  - zod schemas for each table including all versions of the table data, like:
    - insert / update (without id, creationDate, updateDate)
    - full (with id, creationDate, updateDate)
    - list versions (with pagination, cursor, etc)
  - types for each table including all versions of the table data, like:
    - insert / update (without id, creationDate, updateDate)
    - full (with id, creationDate, updateDate)
    - list versions (with pagination, cursor, etc)
    - **Note:** These types should be generated from the zod schemas.
  - well defined / typed repositories for each table
- Storage repository
  - zod schemas for validating file metadata
  - types / interfaces for file metadata (generated from zod schemas)
  - well defined interfaces for storage service and repository
  - service to orchestrate storage operations (including validations, etc...) 
    - **Note:** Understand if there's any difference between the picture and pdf storage operations. If the "storage operations" part of things are the same, we can create a generic storage service and repository, if not, we'll have to be more specific.
  - repository to actually hit appwrite bucket.
- Helper services for more robust behavior, like:
  - metric sync service
  - auth service
- Database / Bucket / Auth
  - zod schemas (like mentioned above for other operations)
  - types / interfaces (like mentioned above for other operations)
  - well defined / typed interfaces / implementations for each operation
  - **Note:** Leave this for last and prompt me further regarding this one so we can come up with a solid plan to cover all we need from each one and avoid over-engineering things we don't need.
- any other operation we might need in the future that is related to appwrite.

This packae should be the ONLY way to interact with appwrite.
All schema, interfaces, types, table definition should keep the current structure. No legacy normalizations or anything that diviate from the current state of appwrite.

The Migrator service should be used only to interface with the apprite package and infrastructure commands to it, like:
- database CRUD operations (create, update, delete)
- run database migrations
- run bucket migrations

The only actual this service should have is to seed the database with the initial data.
The legacy file we have should be addapted to the new structure and logic. (same data, but new properties, etc...)
The seed should take a json file (containing the transformed legacy json file) as input. It should import the corresponding appwrite package exposed services and run as a "consumer" to seed the database, files, etc... 

In zenith project i see you merged on fetch operations into a big cms context. Really weird of understanding and maintain.
Each section should handle its own query / mutations / states. 
We can centralize the appwrite package interactions into unified repository like class for database, storage or any other kind of appwrite opeerations, and han on each section consume those centralized appwrite operation files as needed.

We MUST cover all angles and scenarios we currently have with tests before we do anything to the codebase to avoid breaking things (although its weird, its all working, and it must stay that way).

As we go, we'll create more and more tests for each layer we correct as described above.

We MUST imlemet this in very small steps, and everything should be parallel files untill we are absolutely sure it is working, so we can swap the old implementation with the new one, test and make sure it is working as before. (tests should make sure of it)

I'm preety sue this is TOO MUCH for only one spec. So maybe we can split this into 3 parts? (specs)
- Appwrite package
- Migrator service (this should be a cli tool)
  - Is there good wys of doing this with a good experience in typescript?
- Zenith project (zenith appwrite package consumer)
        
