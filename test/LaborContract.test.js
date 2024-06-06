const LaborContract = artifacts.require("LaborContract");

contract("LaborContract", accounts => {
  const employer = accounts[0];
  const employee = accounts[1];
  const contractAmount = web3.utils.toWei("1", "ether");

  it("should create a contract and hold the funds in escrow", async () => {
    const laborContractInstance = await LaborContract.deployed();

    const tx = await laborContractInstance.createContract(employee, {
      from: employer,
      value: contractAmount
    });

    const event = tx.logs[0].args;
    assert.equal(event.employer, employer, "Employer address mismatch");
    assert.equal(event.employee, employee, "Employee address mismatch");
    assert.equal(event.amount.toString(), contractAmount, "Contract amount mismatch");
  });

  it("should release funds to the employee upon contract completion", async () => {
    const laborContractInstance = await LaborContract.deployed();
    const initialBalance = web3.utils.toBN(await web3.eth.getBalance(employee));

    // Complete the contract
    await laborContractInstance.completeContract(0, { from: employer });

    // Employee withdraws the funds
    await laborContractInstance.withdraw({ from: employee });

    const finalBalance = web3.utils.toBN(await web3.eth.getBalance(employee));
    const balanceDifference = finalBalance.sub(initialBalance);

    // Due to gas costs, the balance difference might not exactly match the contract amount
    // Therefore, we check if the balance difference is within a reasonable range (less than gas cost)
    assert(balanceDifference.gte(web3.utils.toBN(contractAmount).sub(web3.utils.toBN(web3.utils.toWei("0.01", "ether")))),
      "Employee did not receive funds");
  });
});
