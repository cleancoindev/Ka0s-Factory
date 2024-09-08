import React from 'react'
import { Text } from 'rebass'
import TransactionConfirmationModal, { ConfirmationModalContent } from 'components/TransactionConfirmationModal'
import { useTranslation } from 'react-i18next'
import { ButtonPrimary } from 'components/Button'

export default function ConfirmationModal(props: {
  open: boolean
  onDismiss: VoidFunction
  onDeployment: VoidFunction
  txHash: string
  attemptingTxn: boolean
  titleId: string
  content: JSX.Element
  confirmBtnMessageId: string
  pendingMessageId?: string
}) {
  const {
    open,
    onDismiss,
    onDeployment,
    txHash,
    attemptingTxn,
    titleId,
    content,
    confirmBtnMessageId,
    pendingMessageId,
  } = props
  const { t } = useTranslation()

  const ModalBottom = () => (
    <div>
      {content}

      <ButtonPrimary onClick={onDeployment}>
        <Text fontWeight={500} fontSize={20}>
          {t(confirmBtnMessageId)}
        </Text>
      </ButtonPrimary>
    </div>
  )

  return (
    <TransactionConfirmationModal
      isOpen={open}
      onDismiss={onDismiss}
      attemptingTxn={attemptingTxn}
      hash={txHash}
      pendingText={pendingMessageId ? t(pendingMessageId) : ''}
      content={() => (
        <ConfirmationModalContent
          title={t(titleId)}
          onDismiss={onDismiss}
          topContent={() => null}
          bottomContent={ModalBottom}
        />
      )}
    />
  )
}
