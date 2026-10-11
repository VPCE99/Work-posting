import { useCallback, useState } from "react";
import { initialSkills } from "../../data/mock";
import type { Skill } from "../../types";

export function useSkillState() {
  const [skills, setSkills] = useState(initialSkills);

  const addSkill = useCallback((skill: Skill) => {
    setSkills((items) => [skill, ...items]);
  }, []);

  const updateSkill = useCallback((id: string, patch: Partial<Skill>) => {
    setSkills((items) => items.map((item) => item.id === id ? { ...item, ...patch } : item));
  }, []);

  const deleteSkill = useCallback((id: string) => {
    setSkills((items) => items.filter((item) => item.id !== id));
  }, []);

  return { skills, addSkill, updateSkill, deleteSkill };
}
