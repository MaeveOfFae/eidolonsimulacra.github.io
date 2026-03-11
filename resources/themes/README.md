# Theme Resources

This directory contains theme-related repository assets.

Today that means a mix of:

- theme metadata `.toml` files tracked with the repo

These files are useful reference material and may be reused by future surfaces, but the current browser app does not load them directly at runtime.

Note: `midnight.toml` is maintained in the same TOML format as the other theme metadata files and should be treated as a reference asset, not a runtime-loaded preset.

## Built-in Themes

- `dark.toml`: Dark reference theme metadata
- `light.toml`: Light reference theme metadata
- `nyx.toml`: High-contrast signature theme metadata
- `midnight.toml`: Deep blue ocean theme metadata
- `ember.toml`: Warm theme metadata
- `mono.toml`: Clean grayscale theme metadata
- `forest.toml`: Natural green theme metadata
- `solarized_dark.toml`: Solarized Dark theme metadata
- `blood_for_the_blood_god.toml`: Aggressive red-accent theme metadata

Additional theme metadata files also exist, including `silent_king.toml` and `trans.toml`.

## Current Runtime Status

- Browser theme presets currently live in code and browser storage.
- This directory is not automatically watched or imported by the web app.
- If you want these files to become runtime inputs again, wire that behavior into the app explicitly.

## Working With These Files

1. Copy any built-in `.toml` file as a starting point
2. Rename it (e.g., `my_theme.toml`)
3. Edit the color values in the file you copied
4. Keep it aligned with the active browser theme schema if you intend to reuse it in code

### Notes

- Treat these as repo resources, not automatically active UI configuration.
- Update `resources/README.md` if you add a new user-facing resource category.
