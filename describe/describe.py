# Filename: describe.py
# Description: No description available.
# Filename: describe.py
# Description: No description available.
# Filename: describe.py
# Description: No description available.
# Filename: describe.py
# Description: No description available.
# Filename: describe.py
# Description: No description available.
# Filename: describe.py
# Description: No description available.
# Filename: describe.py
# Description: No description available.
# Filename: describe.py
# Description: No description available.
# Filename: describe.py
# Description: No description available.
import os
import sys
import glob
import openai

# Load the OpenAI API key from environment variables
openai.api_key = os.getenv("OPENAI_API_KEY")

# Function to get comment syntax based on file extension
def get_comment_syntax(extension):
    syntax = {
        '.py': '#',
        '.js': '//',
        '.jsx': '//',
        '.html': '<!--',
        '.css': '/*',
        '.tf': '#',
        '.config': '<!--',
        '.json': '//',
        '.sh': '#'
    }
    # Handling cases for extensions with special closing comments
    closing_comment = {
        '.html': '-->',
        '.config': '-->',
        '.css': '*/'
    }
    return syntax.get(extension, '#'), closing_comment.get(extension, '')

# Function to generate description using OpenAI
def generate_description(filename):
    try:
        response = openai.Completion.create(
            model="gpt-3.5-turbo-0125",  # Adjust the model as needed
            prompt=f"Describe the file {filename} and its contents briefly:",
            temperature=0.5,
            max_tokens=100,
            n=1,  # Number of completions to generate
        )
        # Adjust the response handling according to the new structure
        return response.choices[0].text.strip()
    except Exception as e:
        print(f"Error generating description for {filename}: {e}")
        return "No description available."



# Main function to process files
def describe_files(directory, patterns):
    for pattern in patterns:
        for filepath in glob.glob(os.path.join(directory, pattern)):
            filename = os.path.basename(filepath)
            extension = os.path.splitext(filename)[1]
            comment_start, comment_end = get_comment_syntax(extension)

            # Generate description
            description = generate_description(filename)

            # Prepare the header
            header_line_end = "\n" if comment_end else ""
            header = f"{comment_start} Filename: {filename}\n{comment_start} Description: {description}{header_line_end}{comment_end}\n" if comment_end else f"{comment_start} Filename: {filename}\n{comment_start} Description: {description}\n"

            # Read the current file content
            with open(filepath, 'r') as file:
                content = file.read()

            # Write the new content with header
            with open(filepath, 'w') as file:
                file.write(header + content)

            print(f"Processed {filename}")

if __name__ == "__main__":
    directory = os.getcwd()  # Use the current working directory by default
    patterns = sys.argv[1:]  # Patterns are now the first argument onwards

    if not patterns:
        print("Usage: python describe.py [directory] <patterns>")
        sys.exit(1)

    # If the first pattern looks like a directory (simple check), use it as such
    if os.path.isdir(patterns[0]):
        directory = patterns.pop(0)

    describe_files(directory, patterns)
