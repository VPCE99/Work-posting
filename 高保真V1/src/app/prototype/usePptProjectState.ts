import { useCallback, useState } from "react";
import { initialProjects } from "../../data/mock";
import type { PptProject } from "../../types";

export function usePptProjectState() {
  const [projects, setProjects] = useState(initialProjects);
  const [favoriteTemplateIds, setFavoriteTemplateIds] = useState(["official-finance"]);
  const [customTemplates, setCustomTemplates] = useState(["我的品牌模板", "公司标准模板"]);

  const addProject = useCallback((project: PptProject) => {
    setProjects((items) => [project, ...items]);
  }, []);

  const updateProject = useCallback((id: string, patch: Partial<PptProject>) => {
    setProjects((items) => items.map((item) => item.id === id ? { ...item, ...patch } : item));
  }, []);

  const deleteProject = useCallback((id: string) => {
    setProjects((items) => items.filter((item) => item.id !== id));
  }, []);

  const toggleFavoriteTemplate = useCallback((id: string) => {
    setFavoriteTemplateIds((items) => items.includes(id) ? items.filter((item) => item !== id) : [...items, id]);
  }, []);

  const addCustomTemplate = useCallback(() => {
    setCustomTemplates((items) => items.length >= 3 ? items : [...items, `自定义模板 ${items.length + 1}`]);
  }, []);

  const deleteCustomTemplate = useCallback((name: string) => {
    setCustomTemplates((items) => items.filter((item) => item !== name));
  }, []);

  return {
    projects,
    addProject,
    updateProject,
    deleteProject,
    favoriteTemplateIds,
    toggleFavoriteTemplate,
    customTemplates,
    addCustomTemplate,
    deleteCustomTemplate,
  };
}
