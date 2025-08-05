import { screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

/**
 * Submits a form and waits for an error message to appear
 */
export async function submitFormAndWaitForError(
  submitButton: HTMLElement,
  errorText: string | RegExp
) {
  fireEvent.click(submitButton);
  
  await waitFor(() => {
    expect(screen.getByText(errorText)).toBeInTheDocument();
  });
}

/**
 * Submits a form and waits for success
 */
export async function submitFormAndWaitForSuccess(
  submitButton: HTMLElement,
  successText: string | RegExp
) {
  fireEvent.click(submitButton);
  
  await waitFor(() => {
    expect(screen.getByText(successText)).toBeInTheDocument();
  });
}

/**
 * Types into an input and waits for validation
 */
export async function typeAndWaitForValidation(
  input: HTMLElement,
  text: string,
  validationText: string | RegExp
) {
  await userEvent.clear(input);
  await userEvent.type(input, text);
  
  await waitFor(() => {
    expect(screen.getByText(validationText)).toBeInTheDocument();
  });
}

/**
 * Waits for loading to complete
 */
export async function waitForLoadingToComplete(
  loadingText: string | RegExp = /loading/i
) {
  // Wait for loading to appear
  await waitFor(() => {
    expect(screen.getByText(loadingText)).toBeInTheDocument();
  });
  
  // Wait for loading to disappear
  await waitFor(() => {
    expect(screen.queryByText(loadingText)).not.toBeInTheDocument();
  });
}

/**
 * Waits for an element to be enabled
 */
export async function waitForElementToBeEnabled(element: HTMLElement) {
  await waitFor(() => {
    expect(element).toBeEnabled();
  });
}

/**
 * Waits for an element to be disabled
 */
export async function waitForElementToBeDisabled(element: HTMLElement) {
  await waitFor(() => {
    expect(element).toBeDisabled();
  });
}

/**
 * Fills a form with data
 */
export async function fillForm(formData: Record<string, string>) {
  for (const [fieldName, value] of Object.entries(formData)) {
    const input = screen.getByLabelText(new RegExp(fieldName, 'i'));
    await userEvent.clear(input);
    await userEvent.type(input, value);
  }
}

/**
 * Submits a form by pressing Enter
 */
export async function submitFormByEnter(formElement: HTMLElement) {
  fireEvent.submit(formElement);
}

/**
 * Waits for multiple elements to appear
 */
export async function waitForElements(selectors: Array<string | RegExp>) {
  await waitFor(() => {
    selectors.forEach(selector => {
      expect(screen.getByText(selector)).toBeInTheDocument();
    });
  });
}

/**
 * Waits for an API call to complete
 */
export async function waitForApiCall(mockFn: any, expectedUrl?: string) {
  await waitFor(() => {
    if (expectedUrl) {
      expect(mockFn).toHaveBeenCalledWith(
        expect.stringContaining(expectedUrl),
        expect.anything()
      );
    } else {
      expect(mockFn).toHaveBeenCalled();
    }
  });
}