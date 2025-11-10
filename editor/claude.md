This is a web based running on port 5001 by default. You can access it at `http://localhost:5001`.

It is an editor that allows to edit the data in ./data in accordance with the schemas in ./schemas.

All editing should be inline, with the ability to add/remove/edit items as needed.

It should support everything that is in the schemas. It should be able to CRUD categories, spec groups, specifications, enum options, manufacturers, models, etc.

The editor should render everything in a tree like structure with categoires at the top level, spec groups inside categories, specifications inside spec groups, enum options inside specifications of type Enum, etc.
The Specificaitons of a spec group should be rendered as a table node inside the spec group node.