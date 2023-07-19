# GraphGrammar

## Setup for interactive use of GrGen.Net

### Linux

Unpack the package to a directory of your choice, for example into
`/opt/grgen:`

```bash
mkdir /opt/grgen
tar xvfj GrGenNET-V1_3_1-2007-12-06.tar.bz2
mv GrGenNET-V1_3_1-2007-12-06/* /opt/grgen/
rmdir GrGenNET-V1_3_1-2007-12-06
```

Add the `/opt/grgen/bin` directory to your search paths, for instance if you use bash add a line to your `/home/.profile` file.

```bash
export PATH=/opt/grgen/bin:$PATH
```

Furthermore we create a directory for our GrGen.NET data, for instance by mkdir `/home/grgen`.

### Microsoft Windows

Extract the `.zip` archive to a directory of your choice and add the bin subdirectory to your search path via control panel

→ system properties / environment variables.

Execute the GrGen.NET assemblies from a command line window
(Start → Run... → cmd).
For MS .NET the mono prefix is neither applicable nor needed.

## Developing a Grammar

The easiest way to iteratively build a Graph Grammar to produce the desired results, is to use the GrGen-Shell.
Refer to the documentation provided [here](http://www.info.uni-karlsruhe.de/software/grgen/GrGenNET-Manual.pdf).

### Commonly used commands

```bash
grshell.exe
```
