export function serializeUser(user) {
  return { id: String(user._id ?? user.id), name: user.name, email: user.email, role: user.role, createdAt: user.createdAt };
}

export function serializeTopic(topic) {
  return { id: String(topic._id ?? topic.id), slug: topic.slug, name: topic.name, chapter: topic.name, description: topic.description, order: topic.order, parentTopicId: topic.parentTopicId ? String(topic.parentTopicId) : null };
}

export function serializeProblem(problem) {
  const topic = problem.topicId && typeof problem.topicId === 'object' ? problem.topicId : null;
  const links = problem.resources || {};
  return {
    id: problem.slug,
    slug: problem.slug,
    number: problem.number,
    title: problem.title,
    chapter: topic?.name || problem.chapter || '',
    topicSlug: topic?.slug || problem.topicSlug || '',
    difficulty: problem.difficulty,
    pattern: problem.pattern,
    summary: problem.summary,
    estimatedMinutes: problem.estimatedMinutes ?? 30,
    practiceUrl: links.practiceUrl || problem.practiceUrl,
    youtubeUrl: links.youtubeUrl || problem.youtubeUrl,
    articleUrl: links.articleUrl || problem.articleUrl,
  };
}

export function serializeStudyPlan(plan) {
  return {
    id: String(plan._id ?? plan.id),
    title: plan.title,
    topic: plan.topic,
    date: plan.scheduledDate ?? plan.date,
    time: plan.time,
    duration: String(plan.durationMinutes ?? plan.duration),
    durationMinutes: plan.durationMinutes ?? Number(plan.duration),
    notes: plan.notes || '',
    status: plan.status || 'planned',
    createdAt: plan.createdAt,
  };
}
