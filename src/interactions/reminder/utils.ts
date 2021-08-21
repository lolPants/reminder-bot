import { MessageActionRow, MessageButton } from 'discord.js'
import { interactionID } from '../index.js'

interface ReminderButtonOptions {
  disabled?: boolean
  cancelData?: string[]
}

export const generateReminderButtons: (
  options: ReminderButtonOptions
) => MessageActionRow = options => {
  const disabled = options.disabled ?? false
  const context = disabled ? 'dummy' : 'reminder'

  const cancelData = options.cancelData ?? []
  const cancel = new MessageButton()
    .setLabel('Cancel')
    .setCustomId(interactionID(context, 'cancel', ...cancelData))
    .setStyle('DANGER')
    .setDisabled(disabled)

  const row = new MessageActionRow().addComponents(cancel)
  return row
}
