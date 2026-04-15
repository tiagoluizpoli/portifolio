#!/usr/bin/env python3
from __future__ import annotations

import hashlib
import json
import re
from pathlib import Path


def sha256_file(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def extract_frontmatter_and_body(raw: str) -> tuple[str, str]:
    match = re.match(r"^---\n(.*?)\n---\n?", raw, flags=re.DOTALL)
    if not match:
        return "", raw
    return match.group(1), raw[match.end() :]


def extract_description(frontmatter: str, fallback: str) -> str:
    if not frontmatter:
        return fallback

    lines = frontmatter.splitlines()
    for index, line in enumerate(lines):
        stripped = line.strip()
        if not stripped.startswith("description:"):
            continue

        first_value = stripped.split(":", 1)[1].strip().strip('"').strip("'")
        continuation: list[str] = []

        for next_line in lines[index + 1 :]:
            if re.match(r"^[A-Za-z0-9_-]+:\s*", next_line):
                break
            if next_line.startswith("  "):
                continuation.append(next_line.strip())
            elif next_line.strip() == "":
                continue
            else:
                break

        parts = [part for part in [first_value, *continuation] if part]
        if parts:
            return " ".join(parts).strip()

    return fallback


def normalize_agent_id(skill_name: str) -> str:
    if skill_name.startswith("speckit-"):
        return f"speckit.{skill_name.split('speckit-', 1)[1]}"
    return skill_name


def main() -> None:
    repo_root = Path(__file__).resolve().parents[1]
    skills_root = repo_root / ".agents" / "skills"
    agents_dir = repo_root / ".github" / "agents"
    prompts_dir = repo_root / ".github" / "prompts"
    manifest_path = repo_root / ".specify" / "integrations" / "copilot.manifest.json"

    if not skills_root.exists():
        raise SystemExit(f"Skills root not found: {skills_root}")

    agents_dir.mkdir(parents=True, exist_ok=True)
    prompts_dir.mkdir(parents=True, exist_ok=True)

    manifest: dict = {}
    if manifest_path.exists():
        manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    else:
        manifest = {
            "integration": "copilot",
            "version": "0.5.1.dev0",
            "installed_at": "",
            "files": {},
        }

    expected_agent_names: set[str] = set()
    expected_prompt_names: set[str] = set()

    updated_agents = 0
    updated_prompts = 0

    for skill_dir in sorted(path for path in skills_root.iterdir() if path.is_dir()):
        skill_name = skill_dir.name
        skill_file = skill_dir / "SKILL.md"
        if not skill_file.exists():
            continue

        agent_id = normalize_agent_id(skill_name)
        expected_agent_names.add(f"{agent_id}.agent.md")
        expected_prompt_names.add(f"{agent_id}.prompt.md")

        agent_target = agents_dir / f"{agent_id}.agent.md"
        prompt_target = prompts_dir / f"{agent_id}.prompt.md"

        raw = skill_file.read_text(encoding="utf-8")
        frontmatter, body = extract_frontmatter_and_body(raw)
        description = extract_description(
            frontmatter,
            f"Synced from .agents skill '{skill_name}'.",
        )

        agent_content = (
            "---\n"
            f"description: {description}\n"
            f"source: .agents/skills/{skill_name}/SKILL.md\n"
            "---\n\n"
            f"# {skill_name}\n\n"
            "This file is synced from the local skills registry.\n\n"
            f"{body.lstrip()}"
        )
        if not agent_content.endswith("\n"):
            agent_content += "\n"

        prompt_content = f"---\nagent: {agent_id}\n---\n"

        if not agent_target.exists() or agent_target.read_text(encoding="utf-8") != agent_content:
            agent_target.write_text(agent_content, encoding="utf-8")
            updated_agents += 1

        if not prompt_target.exists() or prompt_target.read_text(encoding="utf-8") != prompt_content:
            prompt_target.write_text(prompt_content, encoding="utf-8")
            updated_prompts += 1

    pruned_agents = 0
    pruned_prompts = 0

    for existing in agents_dir.glob("*.agent.md"):
        if existing.name not in expected_agent_names:
            existing.unlink()
            pruned_agents += 1

    for existing in prompts_dir.glob("*.prompt.md"):
        if existing.name not in expected_prompt_names:
            existing.unlink()
            pruned_prompts += 1

    manifest_files: dict[str, str] = {
        key: value for key, value in manifest.get("files", {}).items() if not str(key).startswith("github/")
    }

    for target in sorted(list(agents_dir.glob("*.agent.md")) + list(prompts_dir.glob("*.prompt.md"))):
        rel_path = target.relative_to(repo_root).as_posix()
        manifest_files[rel_path] = sha256_file(target)

    manifest["files"] = manifest_files
    manifest_path.write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")

    print(f"skills={len(expected_agent_names)}")
    print(f"updated_agents={updated_agents}")
    print(f"updated_prompts={updated_prompts}")
    print(f"pruned_agents={pruned_agents}")
    print(f"pruned_prompts={pruned_prompts}")


if __name__ == "__main__":
    main()
