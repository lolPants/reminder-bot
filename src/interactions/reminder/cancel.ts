import { getReminder, removeReminder } from '../../reminders.js'
import type { ButtonHandler } from '../index.js'
import { generateReminderButtons } from './utils.js'

export const reminder__cancel: ButtonHandler = async ({
  components,
  button,
}) => {
  const [id] = components
  if (id === undefined) {
    await button.reply({
      content: 'Failed to resolve reply ID!',
      ephemeral: true,
    })

    return
  }

  const reminder = await getReminder(id)
  if (reminder === undefined) {
    // TODO: Edit message to show reminder has expired
    await button.reply({
      content: 'Reminder has expired.',
      ephemeral: true,
    })

    return
  }

  if (button.message.id !== reminder.messageID) {
    await button.reply({
      content: 'Invalid reminder message.',
      ephemeral: true,
    })

    return
  }

  await removeReminder(id)

  const buttons = generateReminderButtons({ disabled: true })
  await button.update({ components: [buttons] })
}
