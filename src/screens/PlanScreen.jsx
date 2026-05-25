import { useState } from 'react'
import Segmented from '../components/ui/Segmented'
import Button from '../components/ui/Button'
import TemplateCard from '../components/templates/TemplateCard'
import TemplateForm from '../components/templates/TemplateForm'
import GoalCard from '../components/goals/GoalCard'
import GoalForm from '../components/goals/GoalForm'
import { useTemplates, useTemplateActions } from '../hooks/useTemplates'
import { useGoals, useGoalActions } from '../hooks/useGoals'

export default function PlanScreen() {
  const [tab, setTab] = useState('templates')
  const [editingTpl, setEditingTpl] = useState(null)
  const [editingGoal, setEditingGoal] = useState(null)

  const { templates } = useTemplates()
  const { goals } = useGoals()
  const tplActions = useTemplateActions()
  const goalActions = useGoalActions()

  async function saveTemplate(data) {
    if (editingTpl && editingTpl !== 'new') {
      await tplActions.updateTemplate(editingTpl.id, data)
    } else {
      await tplActions.createTemplate(data)
    }
    setEditingTpl(null)
  }
  async function deleteTemplate() {
    if (editingTpl && editingTpl !== 'new') {
      await tplActions.deleteTemplate(editingTpl.id)
    }
    setEditingTpl(null)
  }

  async function saveGoal(data) {
    if (editingGoal && editingGoal !== 'new') {
      await goalActions.updateGoal(editingGoal.id, data)
    } else {
      await goalActions.createGoal(data)
    }
    setEditingGoal(null)
  }
  async function deleteGoal() {
    if (editingGoal && editingGoal !== 'new') {
      await goalActions.deleteGoal(editingGoal.id)
    }
    setEditingGoal(null)
  }

  return (
    <div className="pb-6 pt-1">
      <Segmented
        value={tab}
        onChange={setTab}
        options={[
          { value: 'templates', label: 'Templates' },
          { value: 'goals', label: 'Goals' },
        ]}
      />

      {tab === 'templates' && (
        <>
          {templates.length === 0 && (
            <div className="py-8 text-center text-mute text-sm">
              No templates yet. Add one to auto-fill your daily routine.
            </div>
          )}
          {templates.map((t) => (
            <TemplateCard key={t.id} template={t} onEdit={() => setEditingTpl(t)} />
          ))}
          <Button className="w-full mt-3" onClick={() => setEditingTpl('new')}>+ New Template</Button>
        </>
      )}

      {tab === 'goals' && (
        <>
          {goals.length === 0 && (
            <div className="py-8 text-center text-mute text-sm">
              No goals yet. Add a long-term goal — the AI will use it to plan.
            </div>
          )}
          {goals.map((g) => (
            <GoalCard key={g.id} goal={g} onEdit={() => setEditingGoal(g)} />
          ))}
          <Button className="w-full mt-3" onClick={() => setEditingGoal('new')}>+ New Goal</Button>
        </>
      )}

      {editingTpl && (
        <TemplateForm
          initial={editingTpl === 'new' ? null : editingTpl}
          onSave={saveTemplate}
          onCancel={() => setEditingTpl(null)}
          onDelete={deleteTemplate}
        />
      )}
      {editingGoal && (
        <GoalForm
          initial={editingGoal === 'new' ? null : editingGoal}
          onSave={saveGoal}
          onCancel={() => setEditingGoal(null)}
          onDelete={deleteGoal}
        />
      )}
    </div>
  )
}
