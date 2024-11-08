const mongoose = require("mongoose"); // Make sure to add this line
const Accounts = require("../models/AccountModel"); // Adjust the path to your actual model
const Tags = require("../models/tagModel");
const Contacts = require("../models/contactsModel");
const User = require("../models/userModel");
const companyAddress = require("../models/companyAddressModel");

// POST a new account
const createAccount = async (req, res) => {
  try {
    let newAccount;
    let newCompanyAccount;

    const { clientType, accountName, tags, teamMember, contacts, description, active } = req.body;

    newAccount = await Accounts.create({ clientType, accountName, tags, teamMember, contacts, description, active });

    if (clientType === "Company") {
      const { companyName, country, streetAddress, city, state, postalCode, active } = req.body;

      newCompanyAccount = await companyAddress.create({ companyName, country, streetAddress, city, state, postalCode, companyId: newAccount._id, active });

      // Optionally, update the Accounts document to reference the company address
      newAccount.companyAddress = newCompanyAccount._id; // Ensure the Accounts schema includes companyAddress field
      await newAccount.save();
    }
    res.status(200).json({
      message: "Account created successfully",
      newAccount,
      newCompanyAccount: newCompanyAccount
        ? {
            companyId: newCompanyAccount.companyId,
            companyName: newCompanyAccount.companyName,
            country: newCompanyAccount.country,
            streetAddress: newCompanyAccount.streetAddress,
            city: newCompanyAccount.city,
            state: newCompanyAccount.state,
            postalCode: newCompanyAccount.postalCode,
            active: newCompanyAccount.active,
          }
        : null,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

//get all accounts
const getAccounts = async (req, res) => {
  try {
    const accounts = await Accounts.find({}).populate({ path: "tags", model: "Tags" }).populate({ path: "teamMember", model: "User" }).populate({ path: "contacts", model: "Contacts" }).populate({ path: "companyAddress", model: "companyAddress" });
    //sort({ createdAt: -1 });
    res.status(200).json({ message: "Accounts retrieved successfully", accounts });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//Get a single Account
const getAccount = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: "Invalid Account ID" });
  }
  try {
    const account = await Accounts.findById(id);

    if (!account) {
      return res.status(404).json({ error: "No such Account" });
    }

    res.status(200).json({ message: "Account retrieved successfully", account });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//Get a single Account
const getAccountbyIdAll = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: "Invalid Account ID" });
  }
  try {
    const account = await Accounts.findById(id).populate({ path: "tags", model: "Tags" }).populate({ path: "teamMember", model: "User" }).populate({ path: "contacts", model: "Contacts" }).populate({ path: "companyAddress", model: "companyAddress" });

    if (!account) {
      return res.status(404).json({ error: "No such Account" });
    }

    res.status(200).json({ message: "Account retrieved successfully", account });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//delete a Account

const deleteAccount = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: "Invalid Account ID" });
  }

  try {
    const deletedAccount = await Accounts.findByIdAndDelete({ _id: id });
    if (!deletedAccount) {
      return res.status(404).json({ error: "No such Account" });
    }
    res.status(200).json({ message: "Account deleted successfully", deletedAccount });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// //update a new Account
// const updateAccount = async (req, res) => {
//     const { id } = req.params;
//     // console.log(id)
//     // console.log(req.body)

//     if (!mongoose.Types.ObjectId.isValid(id)) {
//         return res.status(404).json({ error: "Invalid Account ID" });
//     }

//     try {
//         const updatedAccount = await Accounts.findOneAndUpdate(
//             { _id: id },
//             { ...req.body },
//             { new: true }
//         );

//         if (!updatedAccount) {
//             return res.status(404).json({ error: "No such Account" });
//         }

//         res.status(200).json({ message: "Account Updated successfully", updatedAccount });
//     } catch (error) {
//         return res.status(500).json({ error: error.message });
//     }
// };

const updateAccount = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: "Invalid Account ID" });
  }

  try {
    // Extract data from the request body
    const { clientType, accountName, tags, teamMember, companyName, country, streetAddress, city, state, postalCode, contacts, active } = req.body;

    // Find and update the account information
    const updatedAccount = await Accounts.findOneAndUpdate({ _id: id }, { clientType, accountName, tags, teamMember, contacts, active }, { new: true });

    if (!updatedAccount) {
      return res.status(404).json({ error: "No such Account" });
    }

    // If the client type is "Company", update the associated company address
    if (clientType === "Company") {
      if (!updatedAccount.companyAddress) {
        return res.status(404).json({ error: "Company Address not found for this account" });
      }

      const updatedCompanyAddress = await companyAddress.findOneAndUpdate(
        { _id: updatedAccount.companyAddress },
        {
          companyName,
          country,
          streetAddress,
          city,
          state,
          postalCode,
        },
        { new: true }
      );

      if (!updatedCompanyAddress) {
        return res.status(404).json({ error: "Failed to update company address" });
      }

      // Update the company address reference in the account, if needed (if not already existing)
      updatedAccount.companyAddress = updatedCompanyAddress._id;
      await updatedAccount.save();
    }

    res.status(200).json({ message: "Account Updated successfully", updatedAccount });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

//get all accounts List
const getAccountsList = async (req, res) => {
  try {
    const accounts = await Accounts.find({}).populate({ path: "tags", model: "Tags" }).populate({ path: "teamMember", model: "User" }).populate({ path: "contacts", model: "Contacts" });

    const accountlist = accounts.map((account) => {
      return {
        id: account._id,
        Name: account.accountName,
        Follow: "",
        Type: account.clientType,
        Invoices: "",
        Credits: "",
        Tasks: "",
        Team: account.teamMember,
        Tags: account.tags,
        Proposals: "",
        Unreadchats: "",
        Pendingorganizers: "",
        Pendingsignatures: "",
        Lastlogin: "",
        Contacts: account.contacts,
      };
    });

    //sort({ createdAt: -1 });
    res.status(200).json({ message: "Accounts retrieved successfully", accountlist });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//get all accounts List
const getAccountsListById = async (req, res) => {
  const { id } = req.params;
  try {
    const accounts = await Accounts.findById(id).populate({ path: "tags", model: "Tags" }).populate({ path: "teamMember", model: "User" }).populate({ path: "contacts", model: "Contacts" });

    const accountlist = {
      id: accounts._id,
      Name: accounts.accountName,
      Follow: "",
      Type: accounts.clientType,
      Invoices: "",
      Credits: "",
      Tasks: "",
      Team: accounts.teamMember,
      Tags: accounts.tags,
      Proposals: "",
      Unreadchats: "",
      Pendingorganizers: "",
      Pendingsignatures: "",
      Lastlogin: "",
      Contacts: accounts.contacts,
    };
    //sort({ createdAt: -1 });
    res.status(200).json({ message: "Accounts retrieved successfully", accountlist });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getAccountsbyContactId = async (req, res) => {
  const { contactId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(contactId)) {
    return res.status(404).json({ error: "Invalid Contact ID" });
  }

  try {
    // Find all accounts where the contacts field includes the given contactId
    const accounts = await Accounts.find({ contacts: contactId }).populate("contacts").populate("tags").populate("teamMember");

    if (!accounts || accounts.length === 0) {
      return res.status(404).json({ error: "No accounts found for this Contact ID" });
    }

    res.status(200).json({ message: "Accounts retrieved successfully", accounts });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateContactsForAccounts = async (req, res) => {
  const { accountIds, contactId } = req.body; // Assuming accountIds and contactId are sent in the request body

  // Validate input
  if (!Array.isArray(accountIds) || accountIds.length === 0 || !mongoose.Types.ObjectId.isValid(contactId)) {
    return res.status(400).json({ error: "Invalid input: accountIds must be an array and contactId must be valid." });
  }

  try {
    // Update the contacts field for all matching account IDs
    const result = await Accounts.updateMany(
      { _id: { $in: accountIds } }, // Filter by account IDs
      { $addToSet: { contacts: contactId } } // Use $addToSet to avoid duplicates
    );

    if (result.nModified === 0) {
      return res.status(404).json({ message: "No accounts were updated." });
    }

    res.status(200).json({ message: `${result.nModified} account(s) updated successfully.` });
  } catch (error) {
    console.error("Error updating contacts:", error);
    return res.status(500).json({ error: error.message });
  }
};

const removeContactFromAccount = async (req, res) => {
  const { accountId, contactId } = req.params; // Assuming you are passing the accountId and contactId as params

  try {
    // Validate the accountId and contactId are valid MongoDB ObjectIDs
    if (!mongoose.Types.ObjectId.isValid(accountId) || !mongoose.Types.ObjectId.isValid(contactId)) {
      return res.status(400).json({ error: "Invalid accountId or contactId" });
    }

    // Use the $pull operator to remove the contactId from the contacts array
    const updatedAccount = await Accounts.findByIdAndUpdate(
      accountId,
      { $pull: { contacts: contactId } },
      { new: true } // Return the updated account after the removal
    );

    if (!updatedAccount) {
      return res.status(404).json({ error: "Account not found" });
    }

    res.status(200).json({ message: "Contact removed successfully", updatedAccount });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//get all Account List
const getActiveAccountList = async (req, res) => {
  try {
    const { isActive } = req.params;

    // const teamMembers = await TeamMember.find({})
    const accounts = await Accounts.find({ active: isActive }).populate({ path: "tags", model: "Tags" }).populate({ path: "teamMember", model: "User" }).populate({ path: "contacts", model: "Contacts" });

    const accountlist = accounts.map((account) => {
      return {
        id: account._id,
        Name: account.accountName,
        Follow: "",
        Type: account.clientType,
        Invoices: "",
        Credits: "",
        Tasks: "",
        Team: account.teamMember,
        Tags: account.tags,
        Proposals: "",
        Unreadchats: "",
        Pendingorganizers: "",
        Pendingsignatures: "",
        Lastlogin: "",
        Contacts: account.contacts,
      };
    });

    //sort({ createdAt: -1 });
    res.status(200).json({ message: "Accounts retrieved successfully", accountlist });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateContactsForMultipleAccounts = async (req, res) => {
  const { accountIds } = req.body;

  // Validate accountIds array
  if (!Array.isArray(accountIds) || accountIds.length === 0) {
    return res.status(400).json({ error: "accountIds must be a non-empty array" });
  }
  for (const id of accountIds) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: `Invalid Account ID: ${id}` });
    }
  }

  try {
    // Find all accounts with the specified IDs
    const accounts = await Accounts.find({ _id: { $in: accountIds } }).select("contacts");
    if (accounts.length === 0) {
      return res.status(404).json({ error: "No accounts found" });
    }

    // Extract all contact IDs from the accounts
    const contactIds = accounts.flatMap((account) => account.contacts);

    // Extract fields to update from the request body
    const { login, notify, emailSync } = req.body;

    // Update all contacts associated with the specified accounts
    const result = await Contacts.updateMany({ _id: { $in: contactIds } }, { $set: { login, notify, emailSync } });

    res.status(200).json({
      message: "Contacts updated successfully",
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
module.exports = {
  createAccount,
  getAccount,
  getAccounts,
  updateAccount,
  deleteAccount,
  getAccountsList,
  getAccountsListById,
  getAccountsbyContactId,
  updateContactsForAccounts,
  removeContactFromAccount,
  getAccountbyIdAll,
  getActiveAccountList,
  updateContactsForMultipleAccounts,
};
