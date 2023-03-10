/**
 * When user wants to bridge ETH from L1 to L2
 */

import { zeroToLessThanOneETH } from '../../support/common'
import { formatAmount } from '../../../src/util/NumberUtils'

describe('Deposit ETH', () => {
  // when all of our tests need to run in a logged-in state
  // we have to make sure we preserve a healthy LocalStorage state
  // because it is cleared between each `it` cypress test

  const ETHAmountToDeposit = 0.0001

  beforeEach(() => {
    // cy.restoreAppState()
    cy.login({ networkType: 'L1' })
  })
  afterEach(() => {
    // cy.saveAppState()
    cy.logout()
  })

  // Happy Path
  context('User has some ETH and is on L1', () => {
    it('should show L1 and L2 chains correctly', () => {
      cy.findByRole('button', { name: /From: Ethereum/i }).should('be.visible')
      cy.findByRole('button', { name: /To: Arbitrum/i }).should('be.visible')
    })

    context("bridge amount is lower than user's L1 ETH balance value", () => {
      it('should show summary and bridge successfully', () => {
        cy.findByPlaceholderText('Enter amount')
          // https://docs.cypress.io/guides/core-concepts/interacting-with-elements#Scrolling
          // cypress by default tries to scroll the element into view even when it is already in view
          // for unknown reasons, probably due to our root div's overflow:hidden CSS property,
          // cypress would wrongly scroll the div and bring the element to the top of the view
          // and in turn include the full moon into the view, cropping the header out of visible area
          // to circumvent this bug with cypress, scrollBehaviour should be set false for this element
          // because the element is already in view and does not require scrolling
          // https://github.com/cypress-io/cypress/issues/23898
          .typeRecursively(String(ETHAmountToDeposit))
          .then(() => {
            cy.findByText('You’re moving')
              .siblings()
              .last()
              .contains(formatAmount(0.0001, { symbol: 'ETH' }))
              .should('be.visible')
            cy.findByText('You’ll pay in gas fees')
              .siblings()
              .last()
              .contains(zeroToLessThanOneETH)
              .should('be.visible')
            cy.findByText('L1 gas')
              .parent()
              .siblings()
              .last()
              .contains(zeroToLessThanOneETH)
              .should('be.visible')
            cy.findByText('L2 gas')
              .parent()
              .siblings()
              .last()
              .contains(zeroToLessThanOneETH)
              .should('be.visible')
            cy.findByText('Total amount')
              .siblings()
              .last()
              .contains(/(\d*)(\.\d+)*( ETH)/)
              .should('be.visible')
          })
      })

      it('should deposit successfully', () => {
        cy.findByPlaceholderText('Enter amount')
          .typeRecursively(String(ETHAmountToDeposit))
          .then(() => {
            cy.findByRole('button', {
              name: 'Move funds to Arbitrum'
            }).click({ scrollBehavior: false })
            cy.confirmMetamaskTransaction().then(() => {
              cy.findByText(
                `Moving ${formatAmount(0.0001, {
                  symbol: 'ETH'
                })} to Arbitrum`
              ).should('be.visible')
            })
          })
      })

      // TODO => test for bridge amount higher than user's L1 ETH balance
    })

    // TODO
    context('user has some ETH and is on L2', () => {})
    // TODO
    context('user has some ETH and is on wrong chain', () => {})
    // TODO
    context('user has 0 ETH and is on L1', () => {})
    // TODO
    context('user has 0 ETH and is on L2', () => {})
    // TODO
    context('user has 0 ETH and is on wrong chain', () => {})
  })
})
