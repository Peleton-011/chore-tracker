import { useRouter } from 'next/router';
import { useState } from 'react';

export default function HouseholdInvitePage() {
    const router = useRouter();
    const { householdId } = router.query;
    const [inviteLink, setInviteLink] = useState<string>('');

    const generateInviteLink = async () => {
        try {
            const response = await fetch(`/api/household/${householdId}/invite`, {
                method: 'POST'
            });

            const data = await response.json();
            if (response.ok) {
                setInviteLink(data.inviteLink);
            } else {
                alert(data.error);
            }
        } catch (err) {
            alert('Failed to generate invite link');
        }
    };

    return (
        <div>
            <h1>Generate Invite Link</h1>
            <button onClick={generateInviteLink}>Generate Invite Link</button>
            {inviteLink && (
                <div>
                    <p>Invite Link:</p>
                    <a href={inviteLink}>{inviteLink}</a>
                </div>
            )}
        </div>
    );
}
