"use server";
import { db, auth } from "@/firebase/admin";
import { cookies } from "next/headers";

const ONE_WEEK = 60 * 60 * 24 * 7;

export async function signUp(params: SignUpParams) {
  const { uid, name, email } = params;

  try {
    const userRecord = await db.collection("user").doc(uid).get();
    if (userRecord.exists) {
      return {
        success: false,
        message: "User already exists. Please sign in insted.",
      };
    }
    await db.collection("users").doc(uid).set({
      name,
      email,
    });

    return {
      success: true,
      message: "Account created successfully. Please sign in.",
    };
  } catch (error : any) {
    console.error("Error creating a user:", error );
    if (error .code === "auth/email-already-exists") {
      return {
        success: false,
        message: "Email already exists. Please use a different email.",
      };
    }

    return {
      success: false,
      message: "Failed to create user.",
    };
  }
}

export async function signIn(params: SignInParams) {
  const { email, idToken } = params;

  try {
    const userRecord = await auth.getUserByEmail(email);
    if (!userRecord) {
      return {
        success: false,
        message: "User does not exist. Create an account instead.",
      };
    }
    await setSessionCookie(idToken);
  } catch (e) {
    console.log(e);

    return {
      success: false,
      message: "Failed to log into an account. Please try again.",
    };
  }
}

export async function setSessionCookie(idToken: string) {
  const cookieStore = await cookies();

  const sessionCookie = await auth.createSessionCookie(idToken, {
    expiresIn: ONE_WEEK * 1000, // 7days
  });

  cookieStore.set("session", sessionCookie, {
    maxAge: ONE_WEEK,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    sameSite: "lax",
  });
}

export async function getCurrentUser(): Promise<User | null> {
  const cookieStore = await cookies();

  const sessionCookie = cookieStore.get("session")?.value;

  if (!sessionCookie) return null;

  try {
    const decodedClaims = await auth.verifySessionCookie(sessionCookie, true);

    const userRecord = await db
      .collection("users")
      .doc(decodedClaims.uid)
      .get();

    if (!userRecord.exists) return null;

    return {
      ...userRecord.data(),
      id: userRecord.id,
    } as User;
  } catch (e) {
    console.log(e);

    return null;
  }
}

export async function isAuthenticated() {
  const user = await getCurrentUser();

  return !!user; // boolean values
}

// export async function getInterviewsByUserId(
//   userId: string
// ): Promise<Interview[] | null> {
//   const interviews = await db
//     .collection("interviews")
//     .where("userId", "==", userId)
//     .orderBy("createdAt", "desc")
//     .get();

//     return interviews.docs.map((doc) => ({
//       id: doc.id,
//       ...doc.data(),
//     })) as Interview[];
// }

// export async function getLatestInterview(
//   params: GetLatestInterviewsParams
// ): Promise<Interview[] | null> {
//   const { userId, limit = 20 } = params;

//   const interviews = await db
//     .collection("interviews")
//     .orderBy("createdAt", "desc")
//     .where('finalized', '==', true)
//     .where("userId", "!=", userId)
//     .limit(limit)
//     .get();

//   return interviews.docs.map((doc) => ({
//     id: doc.id,
//     ...doc.data(),
//   })) as Interview[];
// }

export async function getInterviewsByUserId(
  userId: string
): Promise<Interview[] | null> {
  // Add this console.log on the line BEFORE db.collection("interviews")...
  console.log(
    `[getInterviewsByUserId] Attempting to fetch interviews for userId: ${userId}`
  );

  try {
    // Wrap your existing code in a try...catch block
    const interviews = await db
      .collection("interviews")
      .where("userId", "==", userId)
      .orderBy("createdAt", "desc")
      .get();

    // Add this console.log right after the .get() call
    console.log(
      `[getInterviewsByUserId] Fetched ${interviews.docs.length} documents for userId: ${userId}`
    );
    if (interviews.docs.length === 0) {
      console.log(
        `[getInterviewsByUserId] No documents found for userId: ${userId}.`
      );
    }

    const result = interviews.docs.map((doc) => {
      const data = doc.data();
      // Add this console.log INSIDE the map function, before returning the object
      console.log(
        `[getInterviewsByUserId] Document ID: ${doc.id}, Data:`,
        data
      );
      return {
        id: doc.id,
        ...data,
      };
    }) as Interview[];

    // Add this console.log right before the return statement
    console.log(
      `[getInterviewsByUserId] Returning ${result.length} interviews.`
    );
    return result;
  } catch (error) {
    // Add this catch block
    console.error(
      `[getInterviewsByUserId] Error fetching interviews for userId ${userId}:`,
      error
    );
    return null; // Return null on error as per your Promise type
  }
}

export async function getLatestInterview(
  params: GetLatestInterviewsParams
): Promise<Interview[] | null> {
  const { userId, limit = 20 } = params;

  // Add this console.log on the line BEFORE db.collection("interviews")...
  console.log(
    `[getLatestInterview] Attempting to fetch latest interviews. Excl. userId: ${userId}, Limit: ${limit}`
  );

  try {
    // Wrap your existing code in a try...catch block
    const interviews = await db
      .collection("interviews")
      .orderBy("createdAt", "desc")
      .where("finalized", "==", true) // This is a crucial condition
      .where("userId", "!=", userId)
      .limit(limit)
      .get();

    // Add this console.log right after the .get() call
    console.log(
      `[getLatestInterview] Fetched ${interviews.docs.length} documents.`
    );
    if (interviews.docs.length === 0) {
      console.log(
        `[getLatestInterview] No documents found for latest interviews.`
      );
    }

    const result = interviews.docs.map((doc) => {
      const data = doc.data();
      // Add this console.log INSIDE the map function, before returning the object
      console.log(`[getLatestInterview] Document ID: ${doc.id}, Data:`, data);
      return {
        id: doc.id,
        ...data,
      };
    }) as Interview[];

    // Add this console.log right before the return statement
    console.log(
      `[getLatestInterview] Returning ${result.length} latest interviews.`
    );
    return result;
  } catch (error) {
    // Add this catch block
    console.error(
      `[getLatestInterview] Error fetching latest interviews for userId ${userId}:`,
      error
    );
    return null; // Return null on error as per your Promise type
  }
}

