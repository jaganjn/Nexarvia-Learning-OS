window.NexarviaAPI = (() => {
  const base = localStorage.getItem("nexarvia-api-base") || "http://localhost:4000";
  async function request(path, options={}) {
    const headers = {"Content-Type":"application/json", ...(options.headers||{})};
    const token = localStorage.getItem("nexarvia-token");
    if (token) headers.Authorization = `Bearer ${token}`;
    const res = await fetch(base + path, {...options,headers});
    const data = await res.json().catch(()=>({}));
    if (!res.ok) throw new Error(data.error || `Request failed: ${res.status}`);
    return data;
  }
  return {
    base,
    register: (body)=>request("/api/auth/register",{method:"POST",body:JSON.stringify(body)}),
    login: async(body)=>{const d=await request("/api/auth/login",{method:"POST",body:JSON.stringify(body)});localStorage.setItem("nexarvia-token",d.token);return d;},
    me: ()=>request("/api/me"),
    dashboard: ()=>request("/api/dashboard"),
    path: ()=>request("/api/learning-path"),
    course: (id)=>request(`/api/courses/${id}`),
    enroll: (id)=>request(`/api/courses/${id}/enroll`,{method:"POST"}),
    lesson: (id)=>request(`/api/lessons/${id}`),
    assessment: (id)=>request(`/api/assessments/${id}`),
    startAttempt: (id)=>request(`/api/assessments/${id}/attempts`,{method:"POST"}),
    saveAnswer: (id,body)=>request(`/api/attempts/${id}/answers`,{method:"PUT",body:JSON.stringify(body)}),
    submitAttempt: (id)=>request(`/api/attempts/${id}/submit`,{method:"POST"}),
    projects: ()=>request("/api/projects"),
    project: (id)=>request(`/api/projects/${id}`),
    submitProject: (id,body)=>request(`/api/projects/${id}/submissions`,{method:"POST",body:JSON.stringify(body)}),
    submission: (id)=>request(`/api/submissions/${id}`),
    reviewSubmission: (id,body)=>request(`/api/submissions/${id}/reviews`,{method:"POST",body:JSON.stringify(body)}),
    evidence: ()=>request("/api/evidence"),
    evidenceItem: (id)=>request(`/api/evidence/${id}`),
    assessmentResults: (id)=>request(`/api/assessments/${id}/results`),
    lessonProgress: (id,body)=>request(`/api/lessons/${id}/progress`,{method:"PUT",body:JSON.stringify(body)}),
    evidence: (body)=>request("/api/evidence",{method:"POST",body:JSON.stringify(body)}),
    submission: (body)=>request("/api/submissions",{method:"POST",body:JSON.stringify(body)}),
    nextAction: ()=>request("/api/recommendations/next",{method:"POST"}),
    graph: ()=>request("/api/graph"),
    profile: (body)=>request("/api/profile",{method:"PATCH",body:JSON.stringify(body)}),
    aiContext: ()=>request("/api/ai/context"),
    aiChat: (question)=>request("/api/ai/chat",{method:"POST",body:JSON.stringify({question})}),
    aiExplain: (body)=>request("/api/ai/explain",{method:"POST",body:JSON.stringify(body)}),
    refreshAIRecommendations: ()=>request("/api/ai/recommendations/refresh",{method:"POST"}),
    aiRemediation: ()=>request("/api/ai/remediation",{method:"POST"}),
    learningSignal: (body)=>request("/api/learning-signals",{method:"POST"}),
    recommendationDecision: (id,accepted)=>request(`/api/recommendations/${id}/decision`,{method:"POST",body:JSON.stringify({accepted})})
  };
})();