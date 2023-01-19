import { Tab } from '@headlessui/react'
import { Fragment, useMemo, useState } from 'react'
import { useActions, useAppState } from '../../state'
import { MergedTransaction } from '../../state/app/state'

import { PendingWithdrawalsLoadedState } from '../../util'
import {
  TransactionsTable,
  TransactionsDataStatus
} from '../TransactionsTable/TransactionsTable'
import { useDeposits } from '../TransactionsTable/useDeposits'

function getTransactionsDataStatus(
  pwLoadedState: PendingWithdrawalsLoadedState
): TransactionsDataStatus {
  switch (pwLoadedState) {
    case PendingWithdrawalsLoadedState.LOADING:
      return 'loading'

    case PendingWithdrawalsLoadedState.ERROR:
      return 'error'

    case PendingWithdrawalsLoadedState.READY:
      return 'success'
  }
}

export type PageParams = {
  searchString?: string
  pageNumber?: number
  pageSize?: number
}

function isDeposit(tx: MergedTransaction) {
  return tx.direction === 'deposit' || tx.direction === 'deposit-l1'
}

export const TransactionHistory = () => {
  const {
    app: { mergedTransactions, pwLoadedState }
  } = useAppState()

  const [pageParams, setPageParams] = useState<PageParams>({
    searchString: '',
    pageNumber: 0,
    pageSize: 10
  })

  const { deposits: depositsFromSubgraph, loading: depositsLoading } =
    useDeposits(pageParams)

  const [deposits, withdrawals] = useMemo(() => {
    const _deposits: MergedTransaction[] = []
    const _withdrawals: MergedTransaction[] = []

    mergedTransactions.forEach(tx => {
      if (isDeposit(tx)) {
        _deposits.push(tx)
      } else {
        _withdrawals.push(tx)
      }
    })

    return [_deposits, _withdrawals]
  }, [mergedTransactions, depositsFromSubgraph])

  return (
    <>
      <Tab.Group>
        <Tab.List>
          <Tab as={Fragment}>
            {({ selected }) => (
              <button
                className={`${
                  !selected ? 'arb-hover' : ''
                } rounded-tl-lg rounded-tr-lg px-4 py-2 ${
                  selected &&
                  `border-2 border-b-0 border-blue-arbitrum border-opacity-80 bg-gray-3`
                }`}
              >
                Deposits
              </button>
            )}
          </Tab>
          <Tab as={Fragment}>
            {({ selected }) => (
              <button
                className={`${
                  !selected ? 'arb-hover' : ''
                } rounded-tl-lg rounded-tr-lg px-4 py-2 ${
                  selected &&
                  `border-2 border-b-0 border-blue-arbitrum border-opacity-80 bg-gray-3`
                }`}
              >
                Withdrawals
              </button>
            )}
          </Tab>
        </Tab.List>
        <Tab.Panel>
          <TransactionsTable
            // Currently we load deposit history from local cache, so it's always a success
            status={depositsLoading ? 'loading' : 'success'}
            transactions={deposits}
            className="-mt-0.5 border-2 border-blue-arbitrum border-opacity-80 bg-gray-3"
            pageParams={pageParams}
            updatePageParams={setPageParams}
          />
        </Tab.Panel>
        <Tab.Panel>
          <TransactionsTable
            status={getTransactionsDataStatus(pwLoadedState)}
            transactions={withdrawals}
            className="-mt-0.5 border-2 border-blue-arbitrum border-opacity-80 bg-gray-3"
            pageParams={pageParams}
            updatePageParams={setPageParams}
          />
        </Tab.Panel>
      </Tab.Group>
    </>
  )
}
