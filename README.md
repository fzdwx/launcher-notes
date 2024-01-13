# Launcher Notes

A simple note extension that supports markdown.

![show](https://github.com/fzdwx/launcher-notes/assets/65269574/9ad1d867-dee4-4e56-bc2e-9ff4accfae97)

### Install

```shell
ray ext local install -o -i '{
    "name": "Notes",
    "description": "A markdown note extension",
    "author": "fzdwx",
    "icon": "https://raw.githubusercontent.com/fzdwx/launcher-notes/main/public/logo.svg",
    "github": "https://github.com/fzdwx/launcher-notes",
    "actions": [
      {
        "name": "New note",
        "command": "newNote"
      }
    ]
}'
```

### Upload image

you should install [ray](https://github.com/fzdwx/launcher/blob/main/launcher-native/cmd/ray/main.go) and
run `ray assets init`

### CHANGELOG

#### 24/01/02

1. Update file list event handler
   - a. click file to open
   - b. double click file to rename

#### 24/01/01

1. support upload image( have to
   install [ray](https://github.com/fzdwx/launcher/blob/main/launcher-native/cmd/ray/main.go) )

#### 23/12/31

1. support render markdown
2. new note
3. rename note
