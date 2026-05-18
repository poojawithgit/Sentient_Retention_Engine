import os
import shutil
import sys
import subprocess

def run_cmd(cmd, cwd=None):
    print(f"Running: {cmd} in {cwd or 'root'}")
    result = subprocess.run(cmd, shell=True, capture_output=True, text=True, cwd=cwd)
    if result.returncode != 0:
        print(f"Error running command: {result.stderr}")
    else:
        print(result.stdout)
    return result.returncode == 0

def create_junction(link, target):
    print(f"Creating junction: {link} -> {target}")
    if os.path.exists(link) or os.path.islink(link):
        if os.path.isdir(link) and not os.path.islink(link):
            # Check if it's a real directory and not a junction/symlink
            try:
                shutil.rmtree(link)
            except Exception as e:
                print(f"Could not remove real directory {link} to create junction: {e}")
                # Try renaming it out of the way
                backup_path = link + "_backup"
                if os.path.exists(backup_path):
                    shutil.rmtree(backup_path)
                os.rename(link, backup_path)
                print(f"Renamed {link} to {backup_path} to avoid conflicts.")
        else:
            os.remove(link)
    
    # Create the junction using cmd mklink
    target_abs = os.path.abspath(target)
    link_abs = os.path.abspath(link)
    run_cmd(f'cmd.exe /c mklink /J "{link_abs}" "{target_abs}"')

def main():
    root = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
    print(f"Workspace root: {root}")
    
    # 1. Kill node processes that might be locking apps/
    print("Terminating potential locking processes...")
    run_cmd("taskkill /f /im node.exe")
    
    # 2. Create the target directories
    directories = [
        "frontend",
        "backend",
        "agents",
        "governance",
        "observability",
        "simulation",
        "shared",
        "security"
    ]
    for d in directories:
        path = os.path.join(root, d)
        if not os.path.exists(path):
            os.makedirs(path)
            print(f"Created root directory: {path}")

    # 3. Move/Copy apps folders to root folders
    mappings = {
        "apps/frontend": "frontend",
        "apps/backend": "backend",
        "apps/agentic-ai": "agents",
        "apps/ml-service": "simulation/ml-service"
    }
    
    for src, dst in mappings.items():
        src_path = os.path.join(root, src)
        dst_path = os.path.join(root, dst)
        
        if os.path.exists(src_path):
            print(f"Moving {src_path} to {dst_path}...")
            # If dst_path exists and has files, remove it first
            if os.path.exists(dst_path):
                shutil.rmtree(dst_path)
            
            try:
                shutil.move(src_path, dst_path)
                print(f"Successfully moved {src_path} to {dst_path}")
            except Exception as e:
                print(f"Shutil.move failed: {e}. Trying robocopy/copytree...")
                # Fallback to copy and delete if locked
                if os.path.exists(dst_path):
                    shutil.rmtree(dst_path)
                shutil.copytree(src_path, dst_path, ignore=shutil.ignore_patterns('node_modules', '.venv', '__pycache__'))
                print(f"Successfully copied (without node_modules/venv) {src_path} to {dst_path}")
        else:
            print(f"Source path {src_path} does not exist. Skipping.")

    # 4. Create backward-compatible directory junctions in apps/
    apps_dir = os.path.join(root, "apps")
    if not os.path.exists(apps_dir):
        os.makedirs(apps_dir)
        
    create_junction(os.path.join(apps_dir, "frontend"), os.path.join(root, "frontend"))
    create_junction(os.path.join(apps_dir, "backend"), os.path.join(root, "backend"))
    create_junction(os.path.join(apps_dir, "agentic-ai"), os.path.join(root, "agents"))
    create_junction(os.path.join(apps_dir, "ml-service"), os.path.join(root, "simulation/ml-service"))

    print("Restructuring complete. Junctions established successfully!")

if __name__ == "__main__":
    main()
