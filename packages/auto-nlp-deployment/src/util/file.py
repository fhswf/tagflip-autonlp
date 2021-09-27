import os


def find_file(name, path):
    for root, dirs, files in os.walk(path):
        for file in files:
            if file == name:
                return os.path.join(root, file)

    return None
