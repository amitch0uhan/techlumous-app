# Diagram schema

Use this stable shape for route maps:

```mermaid
flowchart TD
  subgraph route["Route: /path"]
    subgraph initial["Initial render"]
      clientNode["Component or handler<br/>components/file.tsx<br/>client"]
      serverNode["Function<br/>services/file.ts<br/>server"]
      dbNode[("Table/query<br/>Supabase/Postgres<br/>db")]
      clientNode --> serverNode --> dbNode
    end

    subgraph action["Action: Visible user action"]
      actionClient["Client handler<br/>components/file.tsx<br/>client"]
      actionServer["Server Action<br/>actions/file.ts<br/>server"]
      actionDb[("Mutation<br/>Supabase/Postgres<br/>db")]
      actionClient --> actionServer --> actionDb
    end
  end

  classDef client fill:#dbeafe,stroke:#2563eb,color:#172554
  classDef server fill:#dcfce7,stroke:#16a34a,color:#14532d
  classDef db fill:#fef3c7,stroke:#d97706,color:#78350f
  classDef external fill:#fce7f3,stroke:#db2777,color:#831843
```

Use HTML line breaks in Mermaid labels. Put source links and branch explanations below the diagram, where they do not make the visual dense.
