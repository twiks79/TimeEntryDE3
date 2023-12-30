#!/bin/bash

# Define the directory to search for files (replace with your directory)
directory_to_search="./"  # Change this to your project's directory

# Define the output file name
output_file="collected_source_code.txt"

# Delete or create an empty output file
> "$output_file"

# Search for JavaScript and JSX files, exclude node_modules and build folders,
# and append the path, filename, and source code to the output file
find "$directory_to_search" -type f \( -name "*.js" -o -name "*.jsx" \) \
  ! -path "*/node_modules/*" ! -path "*/.next/*" ! -path "*/build/*" -exec sh -c 'echo "File: {}" >> "$1"; cat {} >> "$1"' sh "$output_file" \;

# Output a message indicating completion
echo "Source code collected with path and filename, and saved to $output_file"
