# Execution of GrGen.Net

The GrGen.Net-folder needs to be in the path-environment-variable of the system.
The execution-context of the GrGen.Net-commands need to be **in** the location of the task to execute (Model, Rules, Shell).

(E.g. `cd` into the folder of the `g[rg|m|rs]`-files.)

## Linux

Linux requires the mono framework to be installed, in path and used infront of the grshell.exe command.

```bash
mono grshell.exe [grs-script]
```

## Loading a graph

When loading a exported graph in a different folder, the model-file with which the graph was created with, needs to be copied into the folder of the current task.
