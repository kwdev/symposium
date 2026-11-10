# Requirements

Requirements state required outcomes and constraints, with their source.

## Configuration

```anchorbook-requirement
schema-version = 1
id = "requirement-preserve-user-choices"
title = "Symposium never replaces configuration the user chose"
status = "draft"
statement = '''
Symposium must not change the user's configuration except as a command the user
ran directs. When it cannot read the user's configuration, nothing it decides
from defaults may outlive the run.
'''
source = '''
The Unobtrusive tenet ("Symposium should never be a reason to opt out") and the
contribution guide's configuration loading chapter: a file Symposium could not
read says nothing about what the user chose.
'''
```

```anchorbook-requirement
schema-version = 1
id = "requirement-hooks-keep-working"
title = "Hooks keep working when the configuration is unusable"
status = "draft"
statement = '''
Hooks must keep running on every agent event when the user configuration cannot
be read or parsed, so a configuration problem never disrupts the user's agent.
'''
source = '''
The Unobtrusive tenet and the configuration loading chapter: hooks run on every
agent event and must keep working.
'''
```

```anchorbook-requirement
schema-version = 1
id = "requirement-no-fresh-risk"
title = "Defaults never enable actions outside Symposium's own files"
status = "draft"
statement = '''
Symposium must not take actions outside its own files on the basis of defaults it
substituted for configuration it could not read.
'''
source = '''
The Safety tenet ("Avoid exposing users to fresh risk") and the configuration
loading chapter, which forces auto-update off because it is the one default that
acts outside Symposium's own files.
'''
```

```anchorbook-requirement
schema-version = 1
id = "requirement-predictable-directories"
title = "User-wide directories follow documented environment settings"
status = "draft"
statement = '''
Symposium's user-wide configuration, cache, and log directories must be
determined by documented environment variables and defaults, following
established conventions for user directories, and must not change with the
directory a command is run from.
'''
source = '''
The "Prefer existing standards over our own" tenet and the configuration
reference's directory resolution table.
'''
```
