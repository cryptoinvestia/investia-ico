import assertRevert from 'zeppelin-solidity/test/helpers/assertRevert';
import latestTime from 'zeppelin-solidity/test/helpers/latestTime';
import { advanceBlock } from 'zeppelin-solidity/test/helpers/advanceToBlock';
import { increaseTimeTo, duration } from 'zeppelin-solidity/test/helpers/increaseTime';

const InvestiaToken = artifacts.require('InvestiaToken');
const InvestiaICO = artifacts.require('InvestiaICO');
const PayingTokenMock = artifacts.require('PayingTokenMock');

contract('InvestiaICO', function (accounts) {
  const rate = 1000;
  const investor = accounts[1];
  const wallet = accounts[9];

  before(async function () {
    await advanceBlock();
  });

  beforeEach(async function () {
    this.startTime = latestTime() + duration.days(1);
    this.afterStartTime = this.startTime + duration.days(1);
    this.endTime = this.startTime + duration.days(3);
    this.afterEndTime = this.endTime + duration.seconds(1);
    this.payingToken = await PayingTokenMock.new(investor, web3.toWei(10000, "ether"));
    this.token = await InvestiaToken.new();
    this.ico = await InvestiaICO.new(this.startTime, this.endTime, rate, this.payingToken.address,
      wallet, this.token.address);
    await this.token.transferOwnership(this.ico.address);
  });

  describe('ico duration', async function () {
    it('should be active after start time', async function () {
      await increaseTimeTo(this.afterStartTime);
      const hasEnded = await this.ico.hasEnded();
      assert.equal(false, hasEnded);
    });

    it('should be inactive after end time', async function () {
      await increaseTimeTo(this.afterEndTime);
      const hasEnded = await this.ico.hasEnded();
      assert.equal(true, hasEnded);
    });
  });

  describe('ownership', async function () {
    it('should not allow to transfer ownership by not owner', async function () {
      await assertRevert(this.ico.transferOwnership(accounts[1], { from: accounts[1] }));
    });

    it('should allow to transfer ownership', async function () {
      await this.ico.transferOwnership(accounts[1]);
      const newOwner = await this.ico.owner();
      assert.equal(accounts[1], newOwner);
    });
  });

  describe('token ownership', async function () {
    it('should disallow to transfer token ownership before ico ends', async function () {
      await assertRevert(this.ico.transferTokenOwnership(wallet));
    });

    describe('after ico has ended', async function () {
      beforeEach(async function () { await increaseTimeTo(this.afterEndTime); });

      it('should disallow non owners to transfer token ownership', async function () {
        await assertRevert(this.ico.transferTokenOwnership(accounts[1], { from: accounts[1] }))
      });

      it('should allow owners to transfer token ownership', async function () {
        await this.ico.transferTokenOwnership(accounts[1]);
        const newTokenOwner = await this.token.owner();
        assert.equal(accounts[1], newTokenOwner);
      });
    });
  });

  describe('changing rate', async function () {
    it('it should allow the owner to reduce the rate', async function () {
      await this.ico.setRate(999);
      const newRate = await this.ico.rate();
      assert.equal(999, newRate);
    });

    it('it should not allow the owner to set the same rate', async function () {
      await assertRevert(this.ico.setRate(1000));
    });
    
    it('should not allow the owner to increase the rate', async function () {
      await assertRevert(this.ico.setRate(2000));
    });
    
    it('should not allow non-owners to change the rate', async function () {
      await assertRevert(this.ico.setRate(999, { from: accounts[1] }));
    });
  });

  describe('sending ether to fallback function', async function () {
    it('should reject transfers before start time', async function () {
      await assertRevert(this.ico.send(web3.toWei(1, "ether")));
    });

    context('when ico is active', function () {
      beforeEach(async function () { await increaseTimeTo(this.afterStartTime); });

      it('should reject transfers of ethereum', async function () {
        await assertRevert(this.ico.send(web3.toWei(1, "ether")));
      });
    });

    context('after ico end', function () {
      beforeEach(async function () { await increaseTimeTo(this.afterEndTime); });

      it('should reject transfers', async function () {
        await assertRevert(this.ico.send(web3.toWei(1, "ether")));
      });
    })
  });

  describe('paying with tokens', function () {
    it('should reject transfers before start time', async function () {
      await this.payingToken.approve(this.ico.address, web3.toWei(2000, "ether"), { from: investor });
      await assertRevert(this.ico.buyWithTokens(web3.toWei(2000, "ether"), { from: investor }));
    });

    context('when ico is active', function () {
      beforeEach(async function () { await increaseTimeTo(this.afterStartTime); });

      it('should issue bonus tokens to wallet address', async function () {
        await this.payingToken.approve(this.ico.address, web3.toWei(2000, "ether"), { from: investor });
        await this.ico.buyWithTokens(web3.toWei(2000, "ether"), { from: investor });
        const walletBalance = await this.token.balanceOf(wallet);
        assert.equal(222222.22222222222, web3.fromWei(walletBalance, "ether").toNumber());
      });

      it('should issue tokens to investor address', async function () {
        await this.payingToken.approve(this.ico.address, web3.toWei(2000, "ether"), { from: investor });
        await this.ico.buyWithTokens(web3.toWei(2000, "ether"), { from: investor });
        const investorBalance = await this.token.balanceOf(investor);
        assert.equal(2000000, web3.fromWei(investorBalance, "ether").toNumber());
      });

      it('should transfer paying tokens to wallet', async function () {
        const balancePre = await this.payingToken.balanceOf(wallet);
        await this.payingToken.approve(this.ico.address, web3.toWei(2000, "ether"), { from: investor });
        await this.ico.buyWithTokens(web3.toWei(2000, "ether"), { from: investor });
        const balancePost = await this.payingToken.balanceOf(wallet);
        const etherDifference = web3.fromWei(balancePost.minus(balancePre), "ether").toNumber();
        assert.equal(2000, etherDifference);
      });

      it('should reject purchases of less than 900 tokens', async function () {
        await this.payingToken.approve(this.ico.address, web3.toWei(899, "ether"), { from: investor });
        await assertRevert(this.ico.buyWithTokens(web3.toWei(899, "ether"), { from: investor }));
        const investorBalance = await this.token.balanceOf(investor);
        assert.equal(0, investorBalance);
      });

      context('without approval', function () {
        it('should not issue bonus tokens to wallet address', async function () {
          await assertRevert(this.ico.buyWithTokens(web3.toWei(10, "ether"), { from: investor }));
          const walletBalance = await this.token.balanceOf(wallet);
          assert.equal(0, walletBalance);
        });

        it('should issue tokens to investor address', async function () {
          await assertRevert(this.ico.buyWithTokens(web3.toWei(10, "ether"), { from: investor }));
          const investorBalance = await this.token.balanceOf(investor);
          assert.equal(0, investorBalance);
        });

        it('should transfer paying tokens to wallet', async function () {
          const balancePre = await this.payingToken.balanceOf(wallet);
          await assertRevert(this.ico.buyWithTokens(web3.toWei(10, "ether"), { from: investor }));
          const balancePost = await this.payingToken.balanceOf(wallet);
          assert.equal(0, balancePost.minus(balancePre));
        });
      });
    });

    context('after ico end', function () {
      beforeEach(async function () { await increaseTimeTo(this.afterEndTime); });

      it('should reject transfers', async function () {
        await this.payingToken.approve(this.ico.address, web3.toWei(2000, "ether"), { from: investor });
        await assertRevert(this.ico.buyWithTokens(web3.toWei(2000, "ether"), { from: investor }));
      });
    })
  });
});
